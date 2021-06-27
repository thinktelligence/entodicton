const entodicton = require('entodicton')
const dialogues = require('./dialogues')

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
  operators: [
    "(<your> ([name]))",
    "(<my> ([name]))",
    //"my name is blah",
  ],
  bridges: [
    { "id": "name", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "your", "level": 0, "bridge": "{ ...after, subject: 'your' }" },
    { "id": "my", "level": 0, "bridge": "{ ...after, subject: 'my' }" },
  ],
  debug: false,
  version: '3',
  words: {
    /*
    " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }" }],
    "one": [{"id": "number", "initial": "{ value: 1 }" }],
    "ten": [{"id": "number", "initial": "{ value: 10 }" }],
    */
  },

  priorities: [
    [['is', 0], ['my', 0]],
    [['is', 0], ['your', 0]],
  ],

  hierarchy: [
    ['name', 'queryable']
  ],

  generators: [
    [ 
      ({context}) => context.marker == 'name' && !context.isQuery && context.response && context.subject == 'your', 
      ({context}) => `my ${context.word}` 
    ],
    [ 
      ({context}) => context.marker == 'name' && !context.isQuery && context.response && context.subject == 'my', 
      ({context}) => `your ${context.word}` 
    ],
    [ 
      ({context}) => context.marker == 'name' && !context.isQuery && context.subject, 
      ({context}) => `${context.subject} ${context.word}` 
    ],
  ],

  semantics: [
    // same
    [ 
      ({context}) => context.marker == 'name' && context.same && context.subject == 'my', 
      ({context, objects}) => {
        // TODO - call g(context.same) here
        api.set('other', 'name', context.same.marker)
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
  ],
};

config = new entodicton.Config(config)
config.add(dialogues)
config.api = api

entodicton.knowledgeModule( { 
  module,
  name: 'avatar',
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
  test: './avatar.test',
})
