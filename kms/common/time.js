const client = require('entodicton/client')
const Config = require('entodicton/src/config')

const pad = (v, l) => {
  const s = String(v)
  const n = l - s.length
  return "0".repeat(n) + s
}

let config = {
  operators: [
    "((([what]) [timeConcept|time]) [equals|is] ([it]))",
    "([use] ((<count> ([timeUnit])) [timeFormat|format]))",
    "(([what]) [equals] (<the> ([timeConcept])))",
    //"what is the time in 24 hour format"
    //"what time is it in Paris"
    //"what time is it in GMT"
    // what is the time
    // how many hours are in a day
  ],
  bridges: [
    { "id": "what", "level": 0, "bridge": "{ ...next(operator), isQuery: true }" },
    { "id": "equals", "level": 0, "bridge": "{ ...next(operator), equals: [before, after] }" },
    { "id": "it", "level": 0, "bridge": "{ ...next(operator), pullFromContext: true }" },
    { "id": "timeConcept", "level": 0, "bridge": "{ ...next(operator), pullFromContext: true }" },

    { "id": "the", "level": 0, "bridge": "{ ...next(after), pullFromContext: true }" },

    { "id": "timeFormat", "level": 0, "bridge": "{ ...before[0], ...next(operator) }" },
    { "id": "count", "level": 0, "bridge": "{ ...after, count: operator[0].value }" },
    { "id": "timeUnit", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "use", "level": 0, "bridge": "{ ...next(operator), format: after[0] }" },
  ],
  floaters: ['isQuery'],
  debug: true,
  priorities: [
  ],
  "version": '3',
  "words": {
    " ([0-9]+)": [{"id": "count", "initial": "{ value: int(group[0]) }" }],
    " hours?": [{"id": "timeUnit", "initial": "{ units: 'hour' }" }],
    " minutes?": [{"id": "timeUnit", "initial": "{ units: 'hour' }" }],
    " seconds?": [{"id": "timeUnit", "initial": "{ units: 'seconds' }" }],
    //"spock": [{"id": "crewMember", 'initial': { 'id': 'spock' } }],
    /*
    " ([0-9]+)": [{"id": "count", "initial": "{ value: int(group[0]) }" }],
    "week": [{"id": "weekConcept", 'initial': { 'language': 'english' } }],
    "dollars": [{"id": "dollarConcept", 'initial': { 'language': 'english' } }],
    "joe": [{"id": "personConcept", 'initial': { 'id': 'joe' } }],
    "sally": [{"id": "personConcept", 'initial': { 'id': 'sally' } }],
    "per": [{"id": "every"}],
    */
  },

  generators: [
    [ ({context}) => context.marker == 'equals', ({g, context}) => `${g(context.equals[0])} is ${g(context.equals[1])}` ],
    [ ({context}) => context.marker == 'timeConcept' && context.value && context.format == 12, ({g, context}) => {
          let hh = context.value.getHours();
          let ampm = 'am'
          if (hh > 12) {
            hh -= 12;
            ampm = 'pm'
          }
          let ss = context.value.getSeconds()
          ss = pad(ss, 2)
          return `${hh}:${ss} ${ampm}` 
        }],
    [ ({context}) => context.marker == 'timeConcept' && context.value && context.format == 24, ({g, context}) => 
        `${context.value.getHours()}:${context.value.getMinutes()}` ],
    [ ({context}) => context.marker == 'timeConcept' && !context.value, ({g, context}) => `the time` ],
    [ ({context}) => context.marker == 'use' && !context.value, ({g, context}) => `the time` ],
    [ ({context}) => context.marker == 'response', ({g, context}) => context.text ],
  ],

  semantics: [
    [({global, context}) => context.marker == 'equals' && context.isQuery, async ({global, context}) => {
      context.isResponse = true
      delete context.isQuery
      delete context.equals[0].isQuery
      context.equals[1] = {
        marker: 'timeConcept',
        value: new Date(),
        format: global.format
      }
    }],
    [({global, context}) => context.marker == 'use' && context.format && (context.format.count == 12 || context.format.count == 24), async ({global, context}) => {
      global.format = context.format.count
    }],
    [({global, context}) => context.marker == 'use' && context.format && (context.format.count != 12 && context.format.count != 24), async ({global, context}) => {
      context.marker = 'response'
      context.text = 'The hour format is 12 hour or 24 hour'
    }],
  ],
};

url = 'http://Deplo-Entod-17J794A370LM3-1965629916.ca-central-1.elb.amazonaws.com'
key = 'f4a879cd-6ff7-4f14-91db-17a11ba77103'

//config.utterances = ['what time is it']
//config.utterances = ['use 24 hour format what time is it use 12 hour format what time is it']
config.utterances = ['what is the time']
console.log(`Running the input: ${config.utterances}`);
config.objects = {
  format: 12  // or 24
};
config = new Config(config)

const knowledgeModule = ({url, key, config, test, debug, module, stopAtFirstFailure = true} = {}) => {
  if ((typeof process) !== 'undefined') {
    const hasTestFlag = () => {
      return process.argv[process.argv.length-1] == 'test'
    }
    if (hasTestFlag()) {
      if (typeof test == 'string') {
        client.runTests(url, key, config, test, { stopAtFirstError: true }).then( (failures) => {
          console.log("failures", JSON.stringify(failures, null, 2))
        })
      } else {
        test()
      }
    } else {
      debug()
    }
  } else {
    module()
  }
}

knowledgeModule( { 
  url,
  key,
  config,
  test: './time.test',
  debug: () => {
    client.process(url, key, config, { writeTests: true, testsFn: './time.test', skipGenerators: true })
      .then( async (responses) => {
        if (responses.errors) {
          console.log('Errors')
          responses.errors.forEach( (error) => console.log(`    ${error}`) )
        }
        console.log('This is the global objects from running semantics:\n', config.objects)
        if (responses.logs) {
          console.log('Logs')
          responses.logs.forEach( (log) => console.log(`    ${log}`) )
        }
        console.log(responses.trace);
        console.log('objects', JSON.stringify(config.get("objects"), null, 2))
        console.log(responses.generated);
      })
      .catch( (error) => {
        console.log(`Error ${config.get('utterances')}`);
        console.log(error.error)
        console.log(error)
      })
  },
  module: () => {
  }
})
