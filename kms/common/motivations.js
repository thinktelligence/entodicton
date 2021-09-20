const entodicton = require('entodicton')
const motivations_tests = require('./motivations.test.json')
const { indent } = require('./helpers')

// motivations that are to be done for sure and motivations that apply in a context
// if condition then action -> condition may be true, this is a semantic

class API {

  apply(args) {
    const { config } = args;
    const motivations = this.objects.motivations
    this.objects.motivations = []
    let done = false;
    for (let motivation of motivations) {
      if (!done && motivation.match(args)) {
        config.processContext(motivation.context)
        done = true
      } else {
        this.objects.motivations.push(motivation)
      }
    }
  }

  // motivation == { match, context }
  // if match(args) then the semantics will be run on context
  motivation(motivation) {
    return this.objects.motivations.push(motivation)
  }

  expect(expectation) {
  }
}
const api = new API()

let config = {
  name: 'motivations',
};

config = new entodicton.Config(config)
config.api = api

config.initializer( (args) => {
  const {objects, isModule, config, addBridge} = args;
  objects.motivations = []
  if (isModule) {
  } else {
    config.addOperator("([do] ([motivations]))")  // this is for testing so I can force the motivation to run
    config.addOperator("([action])")  // this is for testing so I can force the motivation to run
    config.addOperator("([test1])")  // this is for testing so I can force the motivation to run
    config.addBridge({id: "action", level: 0, bridge: "{ ...next(operator) }"})
    config.addBridge({id: "test1", level: 0, bridge: "{ ...next(operator) }"})
    config.addBridge({id: "motivations", level: 0, bridge: "{ ...next(operator) }"})
    config.addBridge({id: "do", level: 0, bridge: "{ ...next(operator), what: after[0] }"})
    config.addGenerator(
      ({context}) => context.marker == 'do',
      ({context}) => `do ${context.what.word}`
    )
      
    config.addSemantic(
        ({context}) => context.marker == 'do', 
        ({context, km}) => km('motivations').api.apply(args)
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

entodicton.knowledgeModule( { 
  module,
  description: 'framework for character motivations',
  config,
  test: {
    name: './motivations.test.json',
    contents: motivations_tests
  },
})
