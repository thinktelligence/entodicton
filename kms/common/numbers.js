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
    // start with a space for regular expressions
    " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }" }],
    "one": [{"id": "number", "initial": "{ value: 1 }" }],
    "two": [{"id": "number", "initial": "{ value: 2 }" }],
    "three": [{"id": "number", "initial": "{ value: 3 }" }],
    "four": [{"id": "number", "initial": "{ value: 4 }" }],
    "five": [{"id": "number", "initial": "{ value: 5 }" }],
    "six": [{"id": "number", "initial": "{ value: 6 }" }],
    "seven": [{"id": "number", "initial": "{ value: 7 }" }],
    "eight": [{"id": "number", "initial": "{ value: 8 }" }],
    "nine": [{"id": "number", "initial": "{ value: 9 }" }],
    "ten": [{"id": "number", "initial": "{ value: 10 }" }],
  },

  hierarchy: [
    { child: 'number', parent: 'queryable', maybe: true },
  ],

  generators: [
    [ ({context}) => context.marker == 'number', ({context}) => `${context.value}` ],
  ],

  semantics: [
  ],
};
config = new entodicton.Config(config, module)
entodicton.knowledgeModule( { 
  module,
  config,
  description: 'talking about numbers',
  test: {
    name: './numbers.test.json',
    contents: numbers_tests
  },
})
