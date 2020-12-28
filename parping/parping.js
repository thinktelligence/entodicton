/*
This is what the output looks like

Running the input: sally worked 10 weeks
This is the global objects from running semantics:
 { workingTime:
   [ { name: 'sally',
       number_of_time_units: 10,
       time_units: 'weekConcept' } ] }
Logs
    Context for choosing the operator ('weekConcept', 0) was [('count', 0), ('personConcept', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('personConcept', 0) was [('count', 0), ('personConcept', 0), ('worked', 0)]
    Context for choosing the operator ('count', 0) was [('count', 0), ('worked', 0)]
    Context for choosing the operator ('worked', 0) was [('worked', 0)]
    Op choices were: [('weekConcept', 0), ('personConcept', 0), ('count', 0), ('worked', 0)]
[ [ 'sally worked 10 weeks' ] ]

*/

const client = require('entodicton/client')
const Config = require('entodicton/src/config')

let objects = {
  players: [
    {
      id: 'player1',
      name: 'aragon',
      eyes: 'blue',
      weight: 82,
      units: 'kg'
    },
    {
      id: 'player2',
      name: 'bilbo',
      eyes: 'brown',
      weight: 50,
      units: 'pounds'
    }
  ]
}

const config = {
  operators: [
    "(([personConcept|who]) [toBe] (<the> ([playerConcept|players])))"
  ],
  bridges: [
    { "id": "personConcept", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "playerConcept", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "the", "level": 0, "bridge": "{ ...next(operator), ...after, pullFromContext: true, number: 'many' }" },

    { "id": "toBe", "level": 0, "bridge": "{ ...operator, subject: before, object: after }" },
  ],
  priorities: [
  ],
  "version": '3',
  "utterances": ["who are the players"],
  debug: true,
  generators: [
    [ (context) => context.marker == 'toBe', (g, context) => `${g(context.subject)} are ${g(context.object)}` ],
    [ (context) => context.marker == 'personConcept' && context.isQuery, (g, context) => `who` ],
    [ (context) => context.marker == 'playerConcept', (g, context) => `the players` ],
    //[ (context) => context.id.startsWith('player'), (g, context) => `${context.name} of eyes ${context.eyes}` ],
    [ (context) => context.id == 'player1', (g, context) => `${context.name} of eyes ${context.eyes}` ],
  ],
  "words": {
    "who": [{"id": "personConcept", 'initial': { 'language': 'english', isQuery: true } }],
    "are": [{"id": "toBe", 'initial': { 'language': 'english', number: 'many' } }],
   },


  semantics: [
    [(global, context) => context.marker == 'toBe', (global, context) => {
      if (context.object[0].marker == 'playerConcept') {
        context.object = [global.players]
      }
     }],
  ],
};

server = "Deplo-Entod-1FI1E5BTIARO4-665482898.ca-central-1.elb.amazonaws.com"
key = "0686949c-0348-411b-9b4b-32e469f2ed85"
port = '80'

const query = 'who are the players'
console.log(`Running the input: ${query}`);
config.utterances = [query]
config.objects = objects;
client.process(new Config(config), key, server, port)
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
    //console.log(responses.trace);
    console.log(responses.generated);
    console.log(JSON.stringify(responses.results, null, 2));
  })
  .catch( (error) => {
    console.log(`Error ${query}`);
    console.log(error)
  })
