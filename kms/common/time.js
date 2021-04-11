const client = require('entodicton/client')
const Config = require('entodicton/src/config')
const Digraph = require('entodicton/src/digraph')

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
    "(([anyConcept]) [equals|is] ([anyConcept]))",
    "([use] ((<count> ([timeUnit])) [timeFormat|format]))",
    //"(([what0|what]) [equals] (<the> ([timeConcept])))",
    "(<the> ([timeConcept|time]))",
    "(<whatP|what> ([anyConcept]))",
    //"what is the time in 24 hour format"
    //"what time is it in Paris"
    //"what time is it in GMT"
    // what is the time
    // how many hours are in a day
  ],
  bridges: [
    { "id": "whatP", "level": 0, "bridge": "{ ...after, isQuery: true }" },
    { "id": "equals", "level": 0, "bridge": "{ ...next(operator), equals: [before, after] }" },
    { "id": "anyConcept", "level": 0, "bridge": "{ ...next(operator), pullFromContext: true }" },
    { "id": "timeConcept", "level": 0, "bridge": "{ ...next(operator) }" },

    { "id": "the", "level": 0, "bridge": "{ ...after, pullFromContext: true }" },

    { "id": "timeFormat", "level": 0, "bridge": "{ ...before[0], ...next(operator) }" },
    { "id": "count", "level": 0, "bridge": "{ ...after, count: operator.value }" },
    { "id": "timeUnit", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "use", "level": 0, "bridge": "{ ...next(operator), format: after[0] }" },

    {"id": "anyConcept", "level": 0, "bridge": "{ ...next(operator) }"},
  ],
  "hierarchy": [
    ["timeConcept", "anyConcept"],
  ],
  associations: {
    negative: [ [['anyConcept', 0], ['timeConcept', 0]] ],
    positive: [ [['whatP', 0], ['timeConcept', 0]] ],
  },
  floaters: ['isQuery'],
  debug: true,
  priorities: [
    [['equals', 0], ['whatP', 0]]
  ],
  "version": '3',
  "words": {
    " ([0-9]+)": [{"id": "count", "initial": "{ value: int(group[0]) }" }],
    " hours?": [{"id": "timeUnit", "initial": "{ units: 'hour' }" }],
    " minutes?": [{"id": "timeUnit", "initial": "{ units: 'hour' }" }],
    " seconds?": [{"id": "timeUnit", "initial": "{ units: 'seconds' }" }],
    "it": [{"id": "anyConcept", "initial": {"language": "english", "pullFromContext": true}}],
    "what": [{"id": "anyConcept", "initial": {language: "english", isQuery: true, pullFromContext: true}}],
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
  ],

  semantics: [
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
  ],
};

//url = 'http://Deplo-Entod-KTIE4UI7CSI-1741854747.ca-central-1.elb.amazonaws.com'
//key = 'f4a879cd-6ff7-4f14-91db-17a11ba77103'
url = "http://184.67.27.82"
key = "6804954f-e56d-471f-bbb8-08e3c54d9321"


//config.utterances = ['what time is it']
//config.utterances = ['what is the time']
//config.utterances = ['the time']
//config.utterances = ['use 24 hour format what time is it use 12 hour format what time is it']
config.utterances = ['use 12 hour format']
//config.utterances = ['use 36 hour format']
console.log(`Running the input: ${config.utterances}`);
config.objects = {
  format: 12  // or 24
};
config = new Config(config)

const knowledgeModule = ({url, key, config, test, debug, module, stopAtFirstFailure = true} = {}) => {
  if ((typeof process) !== 'undefined') {
    getDate = () => new Date("December 25, 1995 10:13 pm")
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
        console.log(JSON.stringify(responses.results, null, 2));
      })
      .catch( (error) => {
        console.log(`Error ${config.get('utterances')}`);
        console.log('error.error', error.error)
        console.log('error.context', error.context)
        console.log('error.logs', error.logs);
        console.log('error.trace', error.trace);
      })
  },
  module: () => {
  }
})
