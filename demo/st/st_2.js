const client = require('entodicton/client')
const Config = require('entodicton/src/config')

objects = {
  enterprise: {
    torpedoes: {
      quantity: 10,
      armed: false
    },
    phasers: {
      armed: false
    }
  },
  mentions: [],
  characters: {
    spock: {
      name: 'Spock',
      toDo: []
    }
  }
}

let config = {
  operators: [
    '([arm] (<the> (<photon> ([torpedoConcept|torpedoes]))))',
    '([showStatus|show] (<the> (<weaponArea|weapons> ([statusConcept|status]))))',
    '([crewMember])'
  ],
  bridges: [
    { "id": "crewMember", "level": 0, "bridge": "{ ...next(operator) }" },

    { "id": "torpedoConcept", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "photon", "level": 0, "bridge": "{ ...after, type: 'photon' }" },
    { "id": "the", "level": 0, "bridge": "{ ...after, pullFromContext: true }" },
    { "id": "arm", "level": 0, "bridge": "{ ...operator, weapon: after[0] }" },

    { "id": "statusConcept", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "weaponArea", "level": 0, "bridge": "{ ...after, area: 'weapons' }" },
    // { "id": "the", "level": 0, "bridge": "{ ...after, pullFromContext: true }" },
    { "id": "showStatus", "level": 0, "bridge": "{ ...operator, area: after[0].area }" },
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
    [ ({context}) => context.marker == 'arm', ({g, context}) => `${g(context.word)} ${g(context.weapon)}` ],
    [ ({context}) => context.marker == 'torpedoConcept' && context.type == 'photon', ({g, context}) => `the ${context.type} ${g(context.word)}` ],
    [ ({context}) => context.marker == 'showStatus' && context.hasAnswer, ({g, context}) => `Ship status is: ${context.status}` ],
  ],

  semantics: [
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

//const query = 'arm the photon torpedoes'
//const query = 'show the weapons status'
//config.utterances = ['show the weapons status arm the photon torpedoes show the weapons status']
config.utterances = ['spock arm the photon torpedoes']
console.log(`Running the input: ${config.utterances}`);
config.objects = objects;
config = new Config(config)
client.process(url, key, config)
  .then( (responses) => {
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
    console.log(objects);
    console.log(responses.generated);
    console.log(JSON.stringify(responses.results, null, 2));
  })
  .catch( (error) => {
    console.log(`Error ${config.utterances}`);
    console.log(error)
  })
