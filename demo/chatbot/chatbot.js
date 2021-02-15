const client = require('entodicton/client')
const Config = require('entodicton/src/config')

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
    "(([i]) [(<cannot> ([unlock]))] (<the> ([door])))",
    "([answer])",
  ],
  bridges: [
    { "id": "i", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "door", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "the", "level": 0, "bridge": "{ ...after, pullFromContext: true }" },
    { "id": "cannot", "level": 0, "bridge": "{ ...after, cannot: true }" },
    { "id": "unlock", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "unlock", "level": 1, "bridge": "{ ...next(operator), what: after[0] }" },

    { "id": "answer", "level": 0, "bridge": "{ ...next(operator) }" },
  ],
  debug: true,
  priorities: [
  ],
  "version": '3',
  "words": {
    "yes": [{"id": "answer", 'initial': { 'value': true } }],
    "yep": [{"id": "answer", 'initial': { 'value': true } }],
    "no": [{"id": "answer", 'initial': { 'value': false } }],
    "nope": [{"id": "answer", 'initial': { 'value': false } }],
  },

  generators: [
    [ ({context}) => context.marker == 'unlock' && context.cannot, ({g, context}) => `${g(context.what)} will not unlock` ],
    [ ({context}) => context.marker == 'door', ({g, context}) => `the ${g(context.word)}` ],
    [ ({context}) => context.marker == 'question', ({g, context}) => `${context.text}` ],
    [ ({context}) => context.marker == 'solution', ({g, context}) => `${context.text}` ],
    [ ({context}) => context.marker == 'answer', ({g, context}) => `${context.word}` ],
  ],

  semantics: [
    [({global, context}) => context.marker == 'answer', ({global, context}) => {
      if (global.question.id == 'greenLight') {
        if (context.value) {
          global.question = { marker: 'question', id: 'videoFeed', text: 'is there any video feed on the screen'}
        } else {
          global.question = { marker: 'question', id: 'videoFeed', text: 'Call the landlord'}
        }
      }
      else if (global.question.id == 'videoFeed') {
        if (context.value) {
          context.marker = 'solution'
          context.text = 'Do solution 2'
        } else {
          context.marker = 'solution'
          context.text = 'Do solution 1'
        }
        global.question = null
      }
     }],
    [({global, context}) => context.marker == 'unlock' && context.cannot, ({global, context}) => {
      global.question = { marker: 'question', id: 'greenLight', text: 'is there a green light on the lock?'}
     }],
  ],
};

// this is the server I used for the website. its shared so processing will be slower. There is two levels of cache.
// One is memory which is fastest but only has the last config run. The other is disk which takes 4 seconds to
// load the neural nets. If the config has changed the neural nets need to be recompiled so that takes 30-50 seconds.

url = 'http://184.67.27.82'
key = '6804954f-e56d-471f-bbb8-08e3c54d9321'

// These are the simulated answers from the tenant
tenantSays = [ "i cannot unlock the door", "yes", "no" ]

const objects = {
  question: {marker: "question", id: 'getProblem', text: "What is the problem"},
  nextQuestion: {
    'unlockAnswer': {marker: "question", id: 'lightOn', text: "Is there a green light on the lock?"},
    'greenLightOnAnswer': {marker: "question", id: 'videoFeedOn', text: "Is there any video feed on the screen?"},
  },
  answers: []
}
initConfig.objects = objects;
config = new Config(initConfig)

counter = 0
const chatLoop = async () => {
  while (config.get('objects').question != null) {
    // convert the question to a user readable string
    const question = config.get('objects').question;
    r = client.processContext(question, { semantics: initConfig.semantics, generators: initConfig.generators, objects: objects })
    console.log('Loop number', counter)
    console.log('Question:', r.generated)
    config.set("utterances", [tenantSays[counter++]])
    console.log(`Simulated response from user: ${config.get('utterances')}`);

    try {
      responses = await client.process(url, key, config);
      if (responses.errors) {
        console.log('Errors')
        responses.errors.forEach( (error) => console.log(`    ${error}`) )
        break
      }
      // paraphrase of result
      console.log(responses.generated[0][0]);
      console.log("\n")
      //console.log('generated', responses.generated);
      //console.log('results', JSON.stringify(responses.results, null, 2));
    } catch( e ) {
      console.log("error", e)
      break
    }
  }
}

(async () => {
  chatLoop()
})();
