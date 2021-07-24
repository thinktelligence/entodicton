const entodicton = require('entodicton')
const { avatar } = require('ekms')

let config = {
  operators: [
    "([arm] (<the> ([weapon|phasers])))",
    "(<your> ([status]))",
  ],
  bridges: [
    { id: 'status', level: 0, bridge: "{ ...next(operator) }" },
    { id: 'weapon', level: 0, bridge: "{ ...next(operator) }" },
    { id: 'arm', level: 0, bridge: "{ ...next(operator), weapon: after[0] }" },
  ],
  hierarchy: [
    ['status', 'queryable']
  ],
  generators: [
    [
      ({context}) => context.paraphrase && context.marker == 'arm',
      ({context, g}) => `${context.word} ${g(context.weapon)}`
    ],
    [
      ({context}) => context.paraphrase && context.marker == 'weapon',
      ({context}) => {
        return `the ${context.word}`
      }
    ],

    [ 
      ({context}) => context.marker == 'status' && !context.isQuery && context.value, 
      ({context}) => context.value
    ],
    [ 
      ({context}) => context.marker == 'status' && !context.isQuery && context.response && context.subject == 'your', 
      ({context}) => `my ${context.word}` 
    ],
    [ 
      ({context}) => context.marker == 'status' && !context.isQuery && context.response && context.subject == 'your', 
      ({context}) => `my ${context.word}` 
    ],
    [ 
      ({context}) => context.marker == 'status' && !context.isQuery && context.response && context.subject == 'my', 
      ({context}) => `your ${context.word}` 
    ],
    [ 
      ({context}) => context.marker == 'status' && !context.isQuery && context.subject, 
      ({context}) => `${context.subject} ${context.word}` 
    ],
  ]
}

config = new entodicton.Config(config)
config.add(avatar)

entodicton.knowledgeModule( { 
  module,
  name: 'crew',
  description: 'crew',
  config,
  test: './crew.test',
})
