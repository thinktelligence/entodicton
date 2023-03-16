const entodicton= require('entodicton')
const dialogues = require('./dialogues')
const _ = require('lodash')
entodicton.ensureTestFile(module, 'events', 'test')
const events_tests = require('./events.test.json')
const sortJson = require('sort-json')

class API {
  happens (context) {
    this.args.insert({ ...context, event: true, hidden: true, inserted: true })
  }

  happened(context, event) {
    return context.event && context.marker == event.marker
  }
}

let config = {
  name: 'events',
  operators: [
    "([after] ([event]) ([action]))",
    "(([changeable]) [changes])",
    { pattern: "([event1])", development: true },
    { pattern: "([action1])", development: true },
  ],
  bridges: [
    { id: "after", level: 0, 
        bridge: "{ ...next(operator), event: after[0], action: after[1], value: null }",
        generatorp: ({context, gp}) => `after ${gp(context.event)} ${gp(context.action)}`,
    },
    { id: "event", level: 0, bridge: "{ ...next(operator) }" },
    { id: "action", level: 0, bridge: "{ ...next(operator) }" },
    { id: "changeable", level: 0, bridge: "{ ...next(operator) }" },
    { id: "changes", level: 0, 
            isA: ['verby'],
            bridge: "{ ...next(operator), changeable: before[0], value: null }",
            generatorp: ({context, g}) => `${g(context.changeable)} changes`,
    },
    { id: "event1", level: 0, bridge: "{ ...next(operator) }", development: true },
    { id: "action1", level: 0, bridge: "{ ...next(operator) }", development: true },
  ],
  hierarchy: [
    { child: 'event1', parent: 'event', development: true },
    { child: 'action1', parent: 'action', development: true },
    ['changes', 'event'],
  ],
  generators: [
    {
      notes: 'paraphrase for events',
      match: ({context, isA}) => isA(context.marker, 'event') && context.event,
      apply: ({context}) => `event happened: ${JSON.stringify(sortJson(context, { depth: 5 }))}`
    },
  ],
  semantics: [
    {
      notes: 'event1',
      development: true,
      match: ({context}) => context.marker == 'event1' && !context.event,
      apply: ({context, kms}) => {
        kms.events.api.happens({ marker: 'event1' })
      }
    },
    {
      notes: 'action1',
      development: true,
      match: ({context, isA}) => context.marker == 'action1',
      apply: ({context, kms}) => {
        context.verbatim = "Doing action1"
      }
    },
    {
      notes: 'after event action handler',
      match: ({context}) => context.marker == 'after',
      apply: ({context, motivation}) => {
          // add motivation that watches for event
          const event = context.event
          if (!event) {
            debugger;
          }
          const action = context.action
          motivation({
            repeat: true,
            match: ({context, kms}) => kms.events.api.happened(context, event),
            apply: ({context, insert}) => { 
              insert(action) 
            }
          })
      }
    },
  ],
};

config = new entodicton.Config(config, module)
config.api = new API()
config.add(dialogues)

entodicton.knowledgeModule({ 
  module,
  name: 'events',
  description: 'do stuff after events',
  config,
  test: {
    name: './events.test.json',
    contents: events_tests,
    include: {
      words: true,
    }
  },
})
