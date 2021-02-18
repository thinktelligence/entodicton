const client = require('entodicton/client')
const Config = require('entodicton/src/config')

const armem = {
  "marker": "arm",
  "word": "arm",
  "paraphrase": "self",
  "weapon": {
    "marker": "torpedoConcept",
    "word": "torpedoes",
    "type": "photon",
    "types": [
      "torpedoConcept"
    ],
    "pullFromContext": true
  }
}

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
      toDo: [armem]
    }
  }
}

let config = {
  operators: [
    '([arm] (<the> (<photon> ([torpedoConcept|torpedoes]))))',
    '([showStatus|show] (<the> (<weaponArea|weapons> ([statusConcept|status]))))',
    '([crewMember])',
    '(([what]) [are] (([you]) [doing]))'
  ],
  bridges: [
    { "id": "what", "level": 0, "bridge": "{ ...next(operator), isQuery: true }" },
    { "id": "you", "level": 0, "bridge": "{ ...next(operator), pullFromContext: true }" },
    { "id": "doing", "level": 0, "bridge": "{ ...next(operator), actor: before[0] }" },
    { "id": "are", "level": 0, "bridge": "{ ...after[0], action: before[0], actor: after[0].actor }" },

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
  floaters: ['isQuery'],
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
    [({global, context}) => context.marker == 'doing' && context.isQuery, ({global, context}) => {
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
      if (global.mentions.length > 0) {
        // character does it
        const contexts = global.characters[global.mentions[0]].toDo
        const doing = contexts.map( (c) => {
          const result = client.processContext(c, { generators: config.get("generators"), global });
          return result.generated
        })
        console.log('doing', JSON.stringify(doing, null, 2));
      } else {
        // ask who 'you' refers to future
        console.log("ask who you refers to case")
        // what is spock doing future
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

//const query = 'arm the photon torpedoes'
//const query = 'show the weapons status'
//config.utterances = ['show the weapons status arm the photon torpedoes show the weapons status']
//config.utterances = ['spock arm the photon torpedoes']
config.utterances = ['spock what are you doing']
console.log(`Running the input: ${config.utterances}`);
config.objects = objects;
config = new Config(config)

const context = {
  "marker": "arm",
  "word": "arm",
  "paraphrase": "self",
  "weapon": {
    "marker": "torpedoConcept",
    "word": "torpedoes",
    "type": "photon",
    "types": [
      "torpedoConcept"
    ],
    "pullFromContext": true
  }
}

/*
config.set('contexts', [context])
console.log('config', config)
console.log('before objects', JSON.stringify(objects, null, 2))
result = client.processContext(context, { semantics: config.get('semantics'), generators: config.get("generators"), objects });
console.log('context', JSON.stringify(result.context, null, 2));
console.log('generated', result.generated);
console.log('after objects', JSON.stringify(objects, null, 2))
*/

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
    console.log('mentions', objects.mentions);
    console.log('spock', JSON.stringify(objects.characters.spock, null, 2));
    console.log('spock.toDo', JSON.stringify(objects.characters.spock.toDo, null, 2));
    console.log(responses.trace);
    console.log(JSON.stringify(objects, null, 2));
    console.log(responses.generated);
    console.log(JSON.stringify(responses.results, null, 2));
  })
  .catch( (error) => {
    console.log(`Error ${config.utterances}`);
    console.log(error)
  })
