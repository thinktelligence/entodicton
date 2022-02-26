const { Config, knowledgeModule } = require('entodicton')
const tell = require('./tell')
const helpers = require('./helpers')
const time_tests = require('./time.test.json')

const pad = (v, l) => {
  const s = String(v)
  const n = l - s.length
  return "0".repeat(n) + s
}

const api = {
  // gets the contexts for doing the happening
  semantics: 
      ({context, isModule, args, api}) => {
        const values = args({ types: ['ampm', 'time'], properties: ['one', 'two']  })
        const ampm = context[values[0]]
        let hour = ampm.hour.hour
        if (ampm.ampm == 'pm') {
          hour += 12;
        }
        const ms = helpers.millisecondsUntilHourOfDay(api.newDate, hour)
        const promise =  new Promise((resolve) => {
          setTimeout( () => resolve(context), ms);
        }).then( () => context )
        context.event = promise
      },

  newDate: () => new Date()
}

let config = {
  name: 'time',
  operators: [
    "([time])",
    "([use] ((<count> ([timeUnit])) [timeFormat|format]))",
    "(([hourUnits|]) [ampm|])"
    //"(([anyConcept]) [equals|is] ([anyConcept]))",
    //"(([what0|what]) [equals] (<the> ([timeConcept])))",
    //"(<whatP|what> ([anyConcept]))",
    //"what is the time in 24 hour format"
    //"what time is it in Paris"
    //"what time is it in GMT"
    // what is the time
    // how many hours are in a day
  ],
  bridges: [
    { "id": "time", "level": 0, "bridge": "{ ...next(operator) }" },

    { "id": "hourUnits", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "ampm", "level": 0, "bridge": "{ ...next(operator), hour: before[0] }" },

    { "id": "timeFormat", "level": 0, "bridge": "{ ...before[0], ...next(operator) }" },
    { "id": "count", "level": 0, "bridge": "{ ...after, count: operator.value }" },
    { "id": "timeUnit", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "use", "level": 0, "bridge": "{ ...next(operator), format: after[0] }" },
  ],
  hierarchy: [
    ['time', 'queryable'],
    ['ampm', 'queryable'],
    ['time', 'theAble'],
  ],
  associations: {
    negative: [
      [['time', 0], ['is', 0], ['count', 0], ['ampm', 0]],
    ],
    positive: [
      [['time', 0], ['is', 0], ['hourUnits', 0], ['ampm', 0]],
    ]
  },

  "words": {
    " ([0-9]+)": [{"id": "count", "initial": "{ value: int(group[0]) }" }],
    " (1[0-2]|[1-9])": [{"id": "hourUnits", "initial": "{ hour: int(group[0]) }" }],
    "am": [{"id": "ampm", "initial": "{ ampm: 'am', determined: true }" }],
    "pm": [{"id": "ampm", "initial": "{ ampm: 'pm', determined: true }" }],
    //" (1[0-2]|[1-9]) ?pm": [{"id": "count", "initial": "{ hour: int(group[0]), part: 'pm' }" }],
    //" (1[0-2]|[1-9]) ?am": [{"id": "count", "initial": "{ hour: int(group[0]), part: 'am' }" }],
    " hours?": [{"id": "timeUnit", "initial": "{ units: 'hour' }" }],
    " minutes?": [{"id": "timeUnit", "initial": "{ units: 'hour' }" }],
    " seconds?": [{"id": "timeUnit", "initial": "{ units: 'seconds' }" }],
  },

  generators: [
    [ 
      ({context}) => context.marker == 'ampm' && context.paraphrase, 
      ({g, context}) => `${context.hour.hour} ${context.ampm}` 
    ],
    [ ({context}) => context.marker == 'time' && context.value && context.format == 12, ({g, context}) => {
      console.log('-------------------', context.value)
          let hh = context.value.getHours();
          let ampm = 'am'
          if (hh > 12) {
            hh -= 12;
            ampm = 'pm'
          }
          let ss = context.value.getMinutes()
          ss = pad(ss, 2)
          return `${hh}:${ss} ${ampm}` 
        }
    ],
    [ ({context}) => context.marker == 'time' && context.value && context.format == 24, ({g, context}) => {
      const pad = (num, size) => {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
      }

        return `${context.value.getHours()}:${pad(context.value.getMinutes(), 2)}` 
      }
    ],
    [ 
      ({context}) => context.marker == 'use' && !context.value, 
      ({g, context}) => `use ${context.format.count} hour time` 
    ],
    [ ({context}) => context.marker == 'response', ({g, context}) => context.text ],
  ],

  semantics: [
    {
      notes: 'evaluate time',
      match: ({objects, context, api}) => context.marker == 'time' && context.evaluate, 
      apply: ({objects, context, api}) => {
        context.value = api.newDate()
        context.evaluateWasProcessed = true
        context.format = objects.format
      }
    },
    {
      notes: 'use time format working case',
      match: ({objects, context}) => context.marker == 'use' && context.format && (context.format.count == 12 || context.format.count == 24), 
      apply: ({objects, context}) => {
        objects.format = context.format.count
      }
    },
    {
      notes: 'use time format error case',
      match: ({objects, context}) => context.marker == 'use' && context.format && (context.format.count != 12 && context.format.count != 24), 
      apply: ({objects, context}) => {
        context.marker = 'response'
        context.text = 'The hour format is 12 hour or 24 hour'
      }
    },
  ],
};

config = new Config(config, module)
config.add(tell)
config.api = api
config.initializer( ({api, config, objects, isModule}) => {
  if (!isModule) {
    api.newDate = () => new Date("December 25, 1995 1:59:58 pm" )
  }
  Object.assign(objects, {
    format: 12  // or 24
  });
  config.addSemantic(
      ({context, hierarchy, args}) => context.happening && context.marker == 'is' && args({ types: ['ampm', 'time'], properties: ['one', 'two'] }),
      api.semantics
  )
})

knowledgeModule({
  module,
  description: 'Time related concepts',
  config,
  test: {
    name: './time.test.json',
    contents: time_tests
  },
})
