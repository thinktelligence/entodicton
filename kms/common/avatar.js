const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const properties = require('./properties')
const avatar_tests = require('./avatar.test.json')
 
let data = {
  me: {
    name: 'molnius',
    age: 23,
    eyes: 'hazel',
  },
  other: {
    name: 'unknown'
  }
}

api = {
  // who in [me, other]
  get: (who, property) => {
    return data[who][property]
  },
  
  set: (who, property, value) => {
    data[who][property] = value
  },
}

let config = {
  name: 'avatar',
  operators: [
    "(<your> ([name]))",
    "(<my> ([name]))",
    // oh we have the same names -> noticing things as part of motiviation
    //"my name is blah",
    // what did you just say
  ],
  bridges: [
    { "id": "name", "level": 0, "bridge": "{ ...next(operator) }" },
  ],

  priorities: [
    [['is', 0], ['my', 0]],
    [['is', 0], ['your', 0]],
    [['is', 0], ['your', 0], ['what', 0]],
  ],

  hierarchy: [
    ['name', 'queryable'],
    ['name', 'property'],
  ],

  semantics: [
    // same
    [ 
      ({context}) => context.marker == 'name' && context.same && context.subject == 'my', 
      ({context, objects, api}) => {
        // TODO - call g(context.same) here
        api.set('other', 'name', context.same.value)
      }
    ],
    // evaluate
    [ 
      ({context}) => context.marker == 'name' && context.evaluate && context.subject == 'your', 
      ({context, api}) => {
        context.value = api.get('me', context.marker)
      }
    ],

    [ 
      ({context}) => context.marker == 'name' && context.evaluate && context.subject == 'my', 
      ({context, api}) => {
        context.value = api.get('other', context.marker)
      }
    ],

    [ 
      ({context}) => context.marker == 'what' && context.topLevel,
      ({context, config}) => {
        const processed = config.get('objects').processed
        context.value = processed[0].responses.join(' ')
        context.response = 1
      }
    ],
  ],
};

config = new entodicton.Config(config)
config.add(dialogues)
config.add(properties)
config.api = api

entodicton.knowledgeModule( { 
  module,
  description: 'avatar for dialogues',
  config,
  // reset the API data before each test.
  beforeTest: () => {
    data = {
      me: {
        name: 'molnius',
        age: 23,
        eyes: 'hazel',
      },
      other: {
        name: 'unknown'
      }
    }
  },
  test: {
    name: './avatar.test.json',
    contents: avatar_tests
  }
})
