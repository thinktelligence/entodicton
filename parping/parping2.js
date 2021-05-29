const entodicton = require('entodicton')

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
    [({objects, context}) => context.marker == 'toBe', ({objects, context}) => {
      console.log('objects', objects)
      context.players = objects.players
      context.hasAnswer = true;
    }],
    [({objects, context}) => context.marker == 'earn', ({objects, context}) => {
      if (! objects.employees ) {
        objects.employees = []
      }
      objects.employees.push({ name: context.who, earnings_per_period: context.amount, period: context.period, units: 'dollars' })
     }],
    [({objects, context}) => context.marker == 'worked', ({objects, context}) => {
      if (! objects.workingTime ) {
        objects.workingTime = []
      }
      objects.workingTime.push({ name: context.who, number_of_time_units: context.duration, time_units: context.units })
     }],
  ],
};

url = process.argv[2] || "http://184.67.27.82"
key = process.argv[3] || "6804954f-e56d-471f-bbb8-08e3c54d9321"

const query = 'who are the players'
console.log(`Running the input: ${query}`);
config.objects = objects;
config = new entodicton.Config(config)
config.server(url, key)
config.process(query)
  .then( (responses) => {
    if (responses.errors) {
      console.log('Errors')
      responses.errors.forEach( (error) => console.log(`    ${error}`) )
    }
    console.log('This is the objects from running semantics:\n', config.objects)
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
