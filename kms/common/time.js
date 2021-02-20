const client = require('entodicton/client')
const Config = require('entodicton/src/config')

let config = {
  operators: [
    "(((<what>) [timeConcept|time]) [equal|is] ([it]))",
    //"what time is it in Paris"
    //"what time is it in GMT"
  ],
  bridges: [
    { "id": "what", "level": 0, "bridge": "{ ...next(after), isQuery: true }" },
    { "id": "equal", "level": 0, "bridge": "{ ...next(operator), equals: [1] }" },
    { "id": "it", "level": 0, "bridge": "{ ...next(operator), pullFromContext: true }" },
    { "id": "timeConcept", "level": 0, "bridge": "{ ...next(operator) }" },
  ],
  debug: true,
  priorities: [
  ],
  "version": '3',
  "words": {
    "spock": [{"id": "crewMember", 'initial': { 'id': 'spock' } }],
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
    [ ({context}) => context.marker == 'crewMember', ({g, context}) => `${g(context.word)}` ],
    [ ({context}) => context.marker == 'arm' && context.paraphrase != 'self', ({g, context}) => `${g(context.word)} ${g(context.weapon)}` ],
    [ ({context}) => context.marker == 'arm' && context.paraphrase == 'self', ({g, context}) => `I am arming ${g(context.weapon)}` ],
    [ ({context}) => context.marker == 'torpedoConcept' && context.type == 'photon', ({g, context}) => `the ${context.type} ${g(context.word)}` ],
    [ ({context}) => context.marker == 'showStatus' && context.hasAnswer, ({g, context}) => `Ship status is: ${context.status}` ],
  ],

  semantics: [
    [({global, context}) => context.marker == 'action', async ({global, context}) => {
      if (context.actor.pullFromContext) {
        actor = global.mentions[0]
        console.log('wwwwwwwwwwwwwwwwwwwww', global.characters[actor].toDo)
        debugger;
        const { context, generated } = client.processContext(global.characters[actor].toDo[0], { semantics: config.get('semantics'), generators: config.get('generators'), objects: config.get('objects') } )
        console.log('context', context)
        console.log('generated', generated)
        //result = await client.process(url, key, config) 
        //console.log('rrrrrrrrrrrrrrrrrrrrrrrrr', result)
      }
     }],
    [({global, context}) => context.marker == 'crewMember', ({global, context}) => {
      global.mentions.push(context.id)
     }],
    [({global, context}) => context.marker == 'arm', ({global, context}) => {
      if (global.mentions.length > 0) {
        // character does it
        global.characters[global.mentions[0]].toDo.push(context)
      } else {
        // computer does it right away
        global.enterprise.torpedoes.armed = true
      }
     }],
    [({global, context}) => context.marker == 'showStatus' && context.area == 'weapons', ({global, context}) => {
      context.hasAnswer = true
      const ps = global.enterprise.phasers.armed ? 'armed' : 'not armed'
      const ts = global.enterprise.torpedoes.armed ? 'armed' : 'not armed'
      context.status = `Phasers: ${ps} Torpedoes: ${ts}`
     }],
  ],
};

url = 'http://Deplo-Entod-17J794A370LM3-1965629916.ca-central-1.elb.amazonaws.com'
key = 'f4a879cd-6ff7-4f14-91db-17a11ba77103'

config.utterances = ['what time is it']
console.log(`Running the input: ${config.utterances}`);
config = new Config(config)

client.process(url, key, config)
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
    console.log(responses.generated);
    console.log(JSON.stringify(responses.results, null, 2));
  })
  .catch( (error) => {
    console.log(`Error ${config.get('utterances')}`);
    console.log(error)
  })
