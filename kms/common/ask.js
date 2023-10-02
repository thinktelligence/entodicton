const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const ask_tests = require('./ask.test.json')
const { indent } = require('./helpers')

// ask that are to be done for sure and ask that apply in a context
// if condition then action -> condition may be true, this is a semantic

class API {
  
  listen(listener) {
  }

  // ask == { query, match, apply }
  // query is sent to user with g(query)
  // match checks if the context matches
  // apply gets the matching contexts and does the action
  ask(ask) {
  }

}
const api = new API()

let config = {
  name: 'ask',
};

config = new Config(config)
config.api = api

config.initializer( (args) => {
  const {objects, isModule, config, addBridge} = args;
  objects.ask = []
  if (isModule) {
  } else {
    config.addOperator("([do] ([ask]))")  // this is for testing so I can force the motivation to run
    config.addOperator("([action])")  // this is for testing so I can force the motivation to run
    config.addOperator("([test1])")  // this is for testing so I can force the motivation to run
    config.addBridge({id: "action", level: 0, bridge: "{ ...next(operator) }"})
    config.addBridge({id: "test1", level: 0, bridge: "{ ...next(operator) }"})
    config.addBridge({id: "ask", level: 0, bridge: "{ ...next(operator) }"})
    config.addBridge({id: "do", level: 0, bridge: "{ ...next(operator), what: after[0] }"})
    config.addGenerator(
      ({context}) => context.marker == 'do',
      ({context}) => `do ${context.what.word}`
    )
      
    config.addSemantic(
        ({context}) => context.marker == 'do', 
        ({context, km}) => km('ask').api.apply(args)
      )
    config.addSemantic(
        ({context}) => context.marker == 'action', 
        ({objects}) => objects.actionWasRun = true
    )
    config.addSemantic(
        ({context}) => context.marker == 'test1', 
        ({config}) => {
          config.api.motivation({ 
            match: ({objects}) => {
              objects.matchWasRun = true
              return true
            },
            context: { marker: 'action' }
          })
        }
    )
  }
})

knowledgeModule( { 
  module,
  description: 'framework for character ask',
  config,
  test: {
    name: './ask.test.json',
    contents: ask_tests
  },
})
