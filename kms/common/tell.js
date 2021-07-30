const entodicton = require('entodicton')
const { dialogues } = require('./dialogues')

api = { 
  // tell the requested user
  tell: (user, what) => {
    console.log(`Tell the user ${JSON.stringify(user)} that ${JSON.stringify(what)} happened`)
  },
  // passed the function to call to check all events
  poll: (poll) => {
    setTimeout( () => poll(), 5000 )
  },

  // list of events being monitored
  requests: [
    // { user, what }
  ]
}

let config = {
  operators: [
    "([tell] ([person]) (<when> ([event])))"
    //"what are the events"
    //"check every 5 minutes"
  ],
  bridges: [
    { id: 'event', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'when', level: 0, bridge: '{ ...after, when: true }' },
    { id: 'person', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'tell', level: 0, bridge: '{ ...next(operator), target: after[0], event: after[1] }' },
  ],
  generators: [
    [
      ({context}) => context.marker == 'tell',
      ({context, g}) => `tell ${g(context.target)} ${g(context.event)}`
    ],
    [
      ({context}) => context.marker == 'event' && context.paraphrase,
      ({context, g}) => `tell ${g(context.target)} ${g(context.event)}`
    ],
  ],
  semantics: [
    [
      ({context, hierarchy}) => !context.happening && hierarchy.isA(context.marker, 'tell'),
      ({context, api, s, config}) => {
        const result = config.processContext({ ...context.event, happening: true })
        const event = result.context.event
        if (event) {
          event.then( (result) => {
            api.tell(context.target, result)
          })
        } else {
          // say config is missing if debug other result
        }
      }
    ],
    // TODO move this to test initialize
    [
      ({context, hierarchy}) => context.happening && hierarchy.isA(context.marker, 'event'),
      ({context}) => {
        context.event = Promise.resolve( { marker: 'event' } )
      }
    ],
  ],
};

config = new entodicton.Config(config)
config.api = api
config.add(dialogues)

entodicton.knowledgeModule( { 
  module,
  name: 'tell',
  description: 'telling entities things',
  config,
  test: './tell.test',
})
