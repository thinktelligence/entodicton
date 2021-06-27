const entodicton = require('entodicton')

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

initObjects = {
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
    [({objects, context}) => context.marker == 'doing' && context.isQuery, ({objects, context}) => {
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
      if (objects.mentions.length > 0) {
        // character does it
        const contexts = objects.characters[objects.mentions[0]].toDo
        const doing = contexts.map( (c) => {
          const result = entodicton.processContext(c, { generators: config.get("generators"), objects });
          return result.generated
        })
        console.log('doing', JSON.stringify(doing, null, 2));
      } else {
        // ask who 'you' refers to future
        console.log("ask who you refers to case")
        // what is spock doing future
      }
     }],
    [({objects, context}) => context.marker == 'crewMember', ({objects, context}) => {
      objects.mentions.push(context.id)
     }],
    [({objects, context}) => context.marker == 'arm', ({objects, context}) => {
      if (objects.mentions.length > 0) {
        // character does it
        objects.characters[objects.mentions[0]].toDo.push(context)
      } else {
        // computer does it right away
        objects.enterprise.torpedoes.armed = true
      }
     }],
    [({objects, context}) => context.marker == 'showStatus' && context.area == 'weapons', ({objects, context}) => {
      context.hasAnswer = true
      const ps = objects.enterprise.phasers.armed ? 'armed' : 'not armed'
      const ts = objects.enterprise.torpedoes.armed ? 'armed' : 'not armed'
      context.status = `Phasers: ${ps} Torpedoes: ${ts}`
     }],
  ],
};

url = process.argv[2] || "http://184.67.27.82"
key = process.argv[3] || "6804954f-e56d-471f-bbb8-08e3c54d9321"
//url = 'http://localhost:3000'
//key = '6804954f-e56d-471f-bbb8-08e3c54d9321'

//const query = 'arm the photon torpedoes'
//const query = 'show the weapons status'
//config.utterances = ['show the weapons status arm the photon torpedoes show the weapons status']
//config.utterances = ['spock arm the photon torpedoes']
const query = 'spock what are you doing'
console.log(`Running the input: ${query}`);
config = new entodicton.Config(config)
config.initializer( ({objects}) => {
  Object.assign(objects, initObjects);
})
config.server(url, key)

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

config.process(query)
  .then( async (responses) => {
    if (responses.errors) {
      console.log('Errors')
      responses.errors.forEach( (error) => console.log(`    ${error}`) )
    }
    console.log('This is the objects from running semantics:\n', config.objects())
    if (responses.logs) {
      console.log('Logs')
      responses.logs.forEach( (log) => console.log(`    ${log}`) )
    }
    console.log('mentions', config.objects().mentions);
    console.log('spock', JSON.stringify(config.objects().characters.spock, null, 2));
    console.log('spock.toDo', JSON.stringify(config.objects().characters.spock.toDo, null, 2));
    console.log(responses.trace);
    //console.log(JSON.stringify(objects, null, 2));
    console.log(JSON.stringify(responses.contexts, null, 2));
    console.log(responses.generated);
  })
  .catch( (error) => {
    console.log(`Error ${config.utterances}`);
    console.log(error)
  })
