const entodicton = require('entodicton')
const numbers_tests = require('./numbers.test.json')

let config = {
  name: 'numbers',
  operators: [
    "([number])",
  ],
  bridges: [
    { "id": "number", "level": 0, "bridge": "{ ...next(operator) }" },
  ],
  debug: false,
  version: '3',
  words: {
    " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }" }],
    "one": [{"id": "number", "initial": "{ value: 1 }" }],
    "ten": [{"id": "number", "initial": "{ value: 10 }" }],
  },

  generators: [
    [ ({context}) => context.marker == 'number', ({context}) => `${context.value}` ],
  ],

  semantics: [
  ],
};
config = new entodicton.Config(config)
entodicton.knowledgeModule( { 
  module,
  config,
  description: 'talking about numbers',
  test: {
    name: './numbers.test.json',
    contents: numbers_tests
  },
})
