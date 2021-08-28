const entodicton = require('entodicton')
const { avatar, properties, tell } = require('ekms')
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
  words: {
    "armed": [{ id: 'status', level: 0, initial: "{ value: 'armed' }" }],
  },
  priorities: [
    [['propertyOf', 0], ['the', 0], ['status', 0]],
    [['info', 0], ['is', 0], ['propertyOf', 0], ['tell', 0], ['the', 0]],
    [['info', 0], ['is', 0], ['tell', 0], ['propertyOf', 0]],
    [['is', 0], ['person', 0], ['tell', 0], ['status', 0], ['propertyOf', 1]],
    [['info', 0], ['is', 0], ['person', 0], ['propertyOf', 0], ['the', 0], ['tell', 0], ['status', 0]],
    [['is', 0], ['tell', 0], ['propertyOf', 0], ['person', 0]],
    [['info', 0], ['is', 0], ['tell', 0], ['propertyOf', 1]]
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
   ],
   [
     ({context, hierarchy, args}) => context.happening && context.marker == 'is' && args({ types: ['status', 'status'], properties: ['one', 'two']}),
     ({context}) => {
       debugger;
       context.event = Promise.resolve( { marker: 'event' } )
       let f;
       context.event = new Promise( (resolve) => {
         f = () => { resolve(context) }
       })
       enterprise.on( (enterprise) => enterprise.weapons.phasers.armed, (enterprise) => f() )
     }
   ],
  ],
}

config = new entodicton.Config(config)
config.add(avatar)
config.add(properties)
config.add(tell)

entodicton.knowledgeModule( { 
  module,
  name: 'crew',
  description: 'crew',
  config,
  test: './crew.test',
})
