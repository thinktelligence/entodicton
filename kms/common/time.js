const { Config, Digraph, knowledgeModule } = require('entodicton')
const dialogues = require('./dialogues')

const pad = (v, l) => {
  const s = String(v)
  const n = l - s.length
  return "0".repeat(n) + s
}

let getDate = () => {
  return new Date()
}

let config = {
  operators: [
    "([time])",
    //"(([anyConcept]) [equals|is] ([anyConcept]))",
    //"([use] ((<count> ([timeUnit])) [timeFormat|format]))",
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
  ],
  hierarchy: [
    ['time', 'queryable'],
  ],
  "version": '3',
  /*
  "words": {
    " ([0-9]+)": [{"id": "count", "initial": "{ value: int(group[0]) }" }],
    " hours?": [{"id": "timeUnit", "initial": "{ units: 'hour' }" }],
    " minutes?": [{"id": "timeUnit", "initial": "{ units: 'hour' }" }],
    " seconds?": [{"id": "timeUnit", "initial": "{ units: 'seconds' }" }],
  },
  */

  generators: [
    [ ({context}) => context.marker == 'time' && context.response, ({g, context}) => `the time` ],
    //[ ({context}) => context.marker == 'time' && context.value, ({g, context}) => `the time => ${context.value}` ],
    [ ({context}) => context.marker == 'time' && context.value && context.format == 12, ({g, context}) => {
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
    [ ({context}) => context.marker == 'time' && context.value && context.format == 24, ({g, context}) => 
        `${context.value.getHours()}:${context.value.getMinutes()}` 
    ],
    /*
    [ ({context}) => context.marker == 'equals' && context.equals, ({g, context}) => `${g(context.equals[0])} is ${g(context.equals[1])}` ],
    [ ({context}) => context.marker == 'timeConcept' && context.value && context.format == 12, ({g, context}) => {
          let hh = context.value.getHours();
          let ampm = 'am'
          if (hh > 12) {
            hh -= 12;
            ampm = 'pm'
          }
          let ss = context.value.getMinutes()
          ss = pad(ss, 2)
          return `${hh}:${ss} ${ampm}` 
        }],
    [ ({context}) => context.marker == 'timeConcept' && context.value && context.format == 24, ({g, context}) => 
        `${context.value.getHours()}:${context.value.getMinutes()}` ],
    [ ({context}) => context.marker == 'timeConcept' && !context.value, ({g, context}) => `the time` ],
    [ ({context}) => context.marker == 'use' && !context.value, ({g, context}) => `use ${context.format.count} hour time` ],
    [ ({context}) => context.marker == 'response', ({g, context}) => context.text ],
    */
  ],

  semantics: [
    [({objects, context}) => context.marker == 'time' && context.evaluate, async ({objects, context}) => {
      context.value = getDate()
      context.format = objects.format
    }],
    /*
    [({objects, context, config}) => context.marker == 'equals' && context.isQuery, async ({objects, context, response, s}) => {
      context.isResponse = true
      delete context.isQuery
      delete context.equals[0].isQuery
      markers = context.equals.map( (c) => c.marker )
      const digraph = new Digraph(response.hierarchy)
      mostSpecific = Array.from(digraph.minima(markers))[0];
      context.equals.map( (c) => c.marker = mostSpecific )
      context.equals.forEach( (c) => {
        if (c.pullFromContext) {
          Object.assign(c, s(c))
        }
      })
      delete context.equals[0].value
    }],

    [({objects, context}) => context.marker == 'timeConcept' && context.pullFromContext, async ({objects, context}) => {
      context.value = getDate()
      context.format = objects.format
    }],
    [({objects, context}) => context.marker == 'use' && context.format && (context.format.count == 12 || context.format.count == 24), async ({objects, context}) => {
      objects.format = context.format.count
    }],
    [({objects, context}) => context.marker == 'use' && context.format && (context.format.count != 12 && context.format.count != 24), async ({objects, context}) => {
      context.marker = 'response'
      context.text = 'The hour format is 12 hour or 24 hour'
    }],
    */
  ],
};

//config.utterances = ['what time is it']
//config.utterances = ['what is the time']
//config.utterances = ['the time']
//config.utterances = ['use 24 hour format what time is it use 12 hour format what time is it']
//config.utterances = ['use 12 hour format']
//config.utterances = ['use 36 hour format']
config = new Config(config)
config.add(dialogues)
config.initializer( ({objects, isModule}) => {
  Object.assign(objects, {
    format: 12  // or 24
  });
  if (!isModule) {
    getDate = () => new Date("December 25, 1995 10:13 pm")
  }
})

knowledgeModule({
  module,
  name: 'time',
  description: 'Time related concepts',
  config,
  test: './time.test',
})
