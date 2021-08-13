const entodicton = require('entodicton')
const dialogues = require('./dialogues')

/*
  Usage:

  1. implement this semantic that returns a promise that fires when the event happends and returns a context that will be send to the user
    [
      ({context, hierarchy, args}) => context.happening && context.marker == 'is' && args([<list of types>], [<list of properties>]),
      ({context}) => {
        context.event = Promise.resolve( { marker: 'event' } )
      }
    ],

  See time.js for example of use of args. args checks the list of properties for properties with the specified types. If all are found then a list of the properties ordered by the types if presented. For example,

    {
      marker: 'is'
      one: { marker: 'ampm' },
      two: { marker: 'time' },
    }

    args(['ampm', 'time'], ['one', 'two']) returns ['one', two']
    args(['time', 'ampm'], ['one', 'two']) returns ['two', one']
*/

api = { 
  // tell the requested user
  tell: (config, user, what) => {
    what.happened = true
    what = config.processContext(what).paraphrases
    console.log(`Tell the user ${JSON.stringify(user)} that ${what}`)
  },
}

let config = {
  name: 'tell',
  operators: [
    "([tell] ([person]) ([info|]) ([event]))"
    //"what are the events"
    //"check every 5 minutes"
  ],
  bridges: [
    { id: 'event', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'info', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'person', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'tell', level: 0, bridge: '{ ...next(operator), target: after[0], info: after[1], event: after[2] }' },
  ],
  words: {
    "when": [{ id: 'info', level: 0, initial: "{ info: 'when' }" }],
  },
  generators: [
    [
      ({context}) => context.marker == 'tell',
      ({context, g}) => `tell ${g(context.target)} ${g(context.info.info)} ${g(context.event)}`
    ],
    [
      ({context}) => context.marker == 'info',
      ({context, g}) => context.info
    ],
    [
      ({context}) => context.marker == 'event' && context.paraphrase,
      ({context, g}) => 'event'
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
            api.tell(config, context.target, result)
          })
        } else {
          // say config is missing if debug other result
        }
      }
    ],
  ],
};

config = new entodicton.Config(config)
config.api = api
config.add(dialogues)
config.initializer( ({config, isModule}) => {
    if (!isModule) {
      config.addSemantic(
        ({context, hierarchy}) => context.happening && hierarchy.isA(context.marker, 'event'),
        ({context}) => {
          context.event = Promise.resolve( { marker: 'event' } )
        }
      )
    }
  })

entodicton.knowledgeModule( { 
  module,
  description: 'telling entities things',
  config,
  test: './tell.test',
})
