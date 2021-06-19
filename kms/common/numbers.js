const entodicton = require('entodicton')

let config = {
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
  name: 'numbers',
  description: 'talking about numbers',
  test: './numbers.test',
})
