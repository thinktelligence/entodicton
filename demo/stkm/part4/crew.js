const entodicton = require('entodicton')
const { avatar, properties } = require('ekms')
const { enterprise } = require('./enterprise')

let config = {
  name: 'crew',
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
    ['status', 'queryable'],
    ['status', 'property'],
    ['weapon', 'object'],
  ],
  priorities: [
    [['propertyOf', 0], ['the', 0], ['status', 0]],
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
  ],

  semantics: [
    [
      ({objects, context, args, hierarchy}) => 
            hierarchy.isA(context.marker, 'status') && 
            args({ types: ['weapon'], properties: ['object'] }) && 
            context.evaluate, 
      async ({objects, context}) => {
        context.value = "value23" 
        if (enterprise.weapons.phasers.armed) {
          context.value = 'armed'
        } else {
          context.value = 'not armed'
        }
      }
   ]
  ],
}

config = new entodicton.Config(config)
config.add(avatar)
config.add(properties)

entodicton.knowledgeModule( { 
  module,
  name: 'crew',
  description: 'crew',
  config,
  test: './crew.test',
})
