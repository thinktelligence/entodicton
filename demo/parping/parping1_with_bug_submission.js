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
  expected_generated: [ [ 'who are the players23' ] ],
  expected_contexts: [
    [
      {
        "marker": "toBe",
        "word": "are",
        "subject": [
          {
            "marker": "who",
            "word": "who"
          }
        ],
        "object": [
          {
            "marker": "playerConcept",
            "word": "players",
            "pullFromContext": true
          }
        ]
      }
    ]
  ],

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
    [ ({context}) => context.marker == 'toBe', ({g, context}) => `${g(context.subject)} are ${g(context.object)}` ],
    [ ({context}) => context.marker == 'who', ({g, context}) => `${g(context.word)}` ],
    [ ({context}) => context.marker == 'playerConcept', ({g, context}) => `the ${g(context.word)}` ],
    [ ({context}) => context.marker == 'earn', ({g, context}) => `${g(context.who)} earns ${g(context.amount)} ${g(context.units)} per ${context.period}` ],
    [ ({context}) => context.marker == 'weekConcept' && context.duration == 1, ({g, context}) => `${context.duration} week` ],
    [ ({context}) => context.marker == 'weekConcept' && context.duration > 1, ({g, context}) => `${context.duration} weeks` ],
    [ ({context}) => context.marker == 'worked', ({g, context}) => `${g(context.who)} worked ${ g({ marker: context.units, duration: context.duration}) }` ],
    [ ({context}) => context.marker == 'response', ({g, context}) => `${context.who} earned ${context.earnings} ${context.units}` ],
  ],

  semantics: [
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

url = "http://Deplo-Entod-1CT3OS32E5XW3-372444999.ca-central-1.elb.amazonaws.com"
key = "0686949c-0348-411b-9b4b-32e469f2ed85"
//url = 'http://localhost:3000'
//key = '6804954f-e56d-471f-bbb8-08e3c54d9321'

const query = 'who are the players'
console.log(`Running the input: ${query}`);
config.utterances = [query]
config.objects = {}
config = new entodicton.Config(config)
const sub_id = 'I-5BHXUAXYCFRB'
const sub_pwd = '94e681d0-3fbf-11eb-86ab-0110b6eaa7fb'
entodicton.submitBug(sub_id, sub_pwd, config)
