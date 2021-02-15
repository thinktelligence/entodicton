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
    { "id": "unlock", "level": 1, "bridge": "{ ...operator, what: after[0] }" },

    { "id": "answer", "level": 0, "bridge": "{ ...operator }" },
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
  ],

  semantics: [
    [({global, context}) => context.marker == 'unlock' && context.cannot, ({global, context}) => {
      global.toDo.push({ marker: 'question', text: 'is there a green light on the lock?'})
     }],
  ],
};

url = 'http://Deplo-Entod-17J794A370LM3-1965629916.ca-central-1.elb.amazonaws.com'
key = 'f4a879cd-6ff7-4f14-91db-17a11ba77103'

tenantSays = [ "i cannot unlock the door", "yes" ]
//tenantSays = [ "i cannot unlock the door", "yes", "no" ]
const objects = {
  toDo: [{marker: "question", text: "What is the problem"}]
}
initConfig.objects = objects;
config = new Config(initConfig)

counter = 0
const chatLoop = async () => {
  while (objects.toDo.length > 0) {
    toDo = objects.toDo.pop()
    r = client.processContext(toDo, { semantics: initConfig.semantics, generators: initConfig.generators, objects: objects })
    console.log('Question:', r.generated)
    config.set("utterances", [tenantSays[counter++]])
    console.log(`Response from user: ${config.get('utterances')}`);

    try {
    responses = await client.process(url, key, config);
    if (responses.errors) {
      console.log('Errors')
      responses.errors.forEach( (error) => console.log(`    ${error}`) )
    }
    console.log(responses.generated);
    console.log(JSON.stringify(responses.results, null, 2));
    } catch( e ) {
      console.log("error", e)
      break
    }
  }
}

(async () => {
  chatLoop()
})();
