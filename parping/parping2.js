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

let config = {
  operators: [
    '(([who]) [toBe|are] (<the> ([playerConcept|players])))',
  ],
  bridges: [
    { "id": "who", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "playerConcept", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "the", "level": 0, "bridge": "{ ...after, pullFromContext: true }" },
    { "id": "toBe", "level": 0, "bridge": "{ ...operator, subject: before, object: after }" },
  ],
  priorities: [
  ],
  "version": '3',
  debug: true,
  generators: [
    [ ({context}) => context.marker == 'toBe' && !context.hasAnswer, ({g, context}) => `${g(context.subject)} are ${g(context.object)}` ],
    [ ({context}) => context.marker == 'toBe' && context.hasAnswer, ({gs, context}) => `the players are ${gs(context.players, ' ', ' and ')}` ],
    [ ({context}) => context.id.startsWith('player'), ({g, context}) => `${g(context.name)}` ],
    [ ({context}) => context.marker == 'who', ({g, context}) => `${g(context.word)}` ],
    [ ({context}) => context.marker == 'playerConcept', ({g, context}) => `the ${g(context.word)}` ],
    [ ({context}) => context.marker == 'earn', ({g, context}) => `${g(context.who)} earns ${g(context.amount)} ${g(context.units)} per ${context.period}` ],
    [ ({context}) => context.marker == 'weekConcept' && context.duration == 1, ({g, context}) => `${context.duration} week` ],
    [ ({context}) => context.marker == 'weekConcept' && context.duration > 1, ({g, context}) => `${context.duration} weeks` ],
    [ ({context}) => context.marker == 'worked', ({g, context}) => `${g(context.who)} worked ${ g({ marker: context.units, duration: context.duration}) }` ],
    [ ({context}) => context.marker == 'response', ({g, context}) => `${context.who} earned ${context.earnings} ${context.units}` ],
  ],

  semantics: [
    [({global, context}) => context.marker == 'toBe', ({global, context}) => {
      console.log('global', global)
      context.players = global.players
      context.hasAnswer = true;
    }],
    [({global, context}) => context.marker == 'earn', ({global, context}) => {
      if (! global.employees ) {
        global.employees = []
      }
      global.employees.push({ name: context.who, earnings_per_period: context.amount, period: context.period, units: 'dollars' })
     }],
    [({global, context}) => context.marker == 'worked', ({global, context}) => {
      if (! global.workingTime ) {
        global.workingTime = []
      }
      global.workingTime.push({ name: context.who, number_of_time_units: context.duration, time_units: context.units })
     }],
  ],
};

url = "http://Deplo-Entod-1CT3OS32E5XW3-372444999.ca-central-1.elb.amazonaws.com"
key = "0686949c-0348-411b-9b4b-32e469f2ed85"

const query = 'who are the players'
console.log(`Running the input: ${query}`);
config.utterances = [query]
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
    //console.log(responses.trace);
    console.log('generated', responses.generated);
    console.log('results', JSON.stringify(responses.results, null, 2));
  })
  .catch( (error) => {
    console.log(`Error ${query}`);
    console.log(error)
  })
