const entodicton = require('entodicton')

/*
Tenant: I can't unlock the door

Bot: Is there a green light on the lock?

Tenant: Yes

Bot: Is there any video feed on the screen?

Tenant: No

Bot: Solution 1
*/

let initConfig = {
  operators: [
    "(([i]) [(<cannot> ([unlock1|unlock]))] (<the> ([door])))",
    "((<the> ([door])) [(<wont> ([unlock2|unlock]))])",
    "([answer])",
  ],
  bridges: [
    { "id": "i", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "door", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "the", "level": 0, "bridge": "{ ...after, pullFromContext: true }" },
    { "id": "cannot", "level": 0, "bridge": "{ ...after, cannot: true }" },
    { "id": "unlock1", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "unlock1", "level": 1, "bridge": "{ ...next(operator), what: after[0] }" },

    { "id": "wont", "level": 0, "bridge": "{ ...after, cannot: true }" },
    { "id": "unlock2", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "unlock2", "level": 1, "bridge": "{ ...next(operator), what: before[0], marker: operator('unlock1', 1) }" },

    { "id": "answer", "level": 0, "bridge": "{ ...next(operator) }" },
  ],
  debug: true,
  priorities: [
  ],
  "version": '3',
  "words": {
    "cant": [{"id": "cannot"}],
    "yes": [{"id": "answer", 'initial': { 'value': true } }],
    "yep": [{"id": "answer", 'initial': { 'value': true } }],
    "no": [{"id": "answer", 'initial': { 'value': false } }],
    "nope": [{"id": "answer", 'initial': { 'value': false } }],
  },

  generators: [
    [ ({context}) => context.marker == 'unlock1' && context.cannot, ({g, context}) => `${g(context.what)} will not unlock` ],
    [ ({context}) => context.marker == 'door', ({g, context}) => `the ${g(context.word)}` ],
    [ ({context}) => context.marker == 'question', ({g, context}) => `${context.text}` ],
    [ ({context}) => context.marker == 'solution', ({g, context}) => `${context.text}` ],
    [ ({context}) => context.marker == 'answer', ({g, context}) => `${context.word}` ],
  ],

  semantics: [
    [({objects, context}) => context.marker == 'answer', ({objects, context}) => {
      if (objects.question.id == 'greenLight') {
        if (context.value) {
          objects.question = { marker: 'question', id: 'videoFeed', text: 'is there any video feed on the screen'}
        } else {
          objects.question = { marker: 'question', id: 'videoFeed', text: 'Call the landlord'}
        }
      }
      else if (objects.question.id == 'videoFeed') {
        if (context.value) {
          context.marker = 'solution'
          context.text = 'Do solution 2'
        } else {
          context.marker = 'solution'
          context.text = 'Do solution 1'
        }
        objects.question = null
      }
     }],
    [({objects, context}) => context.marker == 'unlock1' && context.cannot, ({objects, context}) => {
      objects.question = { marker: 'question', id: 'greenLight', text: 'is there a green light on the lock?'}
     }],
  ],
};

// this is the server I used for the website. its shared so processing will be slower. There is two levels of cache.
// One is memory which is fastest but only has the last config run. The other is disk which takes 4 seconds to
// load the neural nets. If the config has changed the neural nets need to be recompiled so that takes 30-50 seconds.

url = 'http://184.67.27.82'
key = '6804954f-e56d-471f-bbb8-08e3c54d9321'
//url = 'http://localhost:3000'
//key = '6804954f-e56d-471f-bbb8-08e3c54d9321'

// These are the simulated answers from the tenant
tenantSays = [ "i cannot unlock the door", "yes", "no" ]
//tenantSays = [ "i cant unlock the door", "yes", "no" ]
//tenantSays = [ "the door wont unlock", "yes", "no" ]

const objects = {
  question: {marker: "question", id: 'getProblem', text: "What is the problem"},
  nextQuestion: {
    'unlockAnswer': {marker: "question", id: 'lightOn', text: "Is there a green light on the lock?"},
    'greenLightOnAnswer': {marker: "question", id: 'videoFeedOn', text: "Is there any video feed on the screen?"},
  },
  answers: []
}
initConfig.objects = objects;
config = new entodicton.Config(initConfig)
config.server(url, key)

const debugOne = async () => {
  try {
    //config.set("utterances", ['the door wont unlock'])
    config.set("utterances", ['i cannot unlock the door'])
    responses = await config.process(url, key, config);
    console.log('generated', responses.generated);
    console.log('contexts', JSON.stringify(responses.contexts, null, 2));
  } catch( e ) {
    console.log('e', e);
  }
}

counter = 0
const chatLoop = async () => {
  while (config.get('objects').question != null) {
    // convert the question to a user readable string
    const question = config.get('objects').question;
    //r = config.processContext(question, { semantics: initConfig.semantics, generators: initConfig.generators, objects: objects })
    const r = config.processContext(question);
    console.log('Loop number', counter)
    console.log('Question:', r.generated)
    //config.set("utterances", [tenantSays[counter++]])
    const query = tenantSays[counter++]
    console.log(`Simulated response from user: ${query}`);

    try {
      responses = await config.process(query);
      if (responses.errors) {
        console.log('Errors')
        responses.errors.forEach( (error) => console.log(`    ${error}`) )
        break
      }
      // paraphrase of result
      console.log('Computer response:', responses.generated[0]);
      console.log("\n")
      //console.log('generated', responses.generated);
      //console.log('contexts', JSON.stringify(responses.contexts, null, 2));
    } catch( e ) {
      console.log("error", e)
      break
    }
  }
}

(async () => {
  chatLoop()
  //debugOne()
})();
