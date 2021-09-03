const entodicton = require('entodicton')
const dialogues = require('./dialogues')

let config = {
  name: 'javascript',
  operators: [
    "((<let> ([variable|])) [assignment|] (value))",
    "(<the> ([variable]))",
    //"(((((console)[.](log))['(']) ([arg]) [')'])"
  ],
  bridges: [
    { "id": "let", "level": 0, "bridge": "{ ...after[0], scope: 'let' }" },
    { "id": "variable", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "assignment", "level": 0, "bridge": "{ ...next(operator), variable: before[0], value: after[0] }" },
  ],
  debug: false,
  version: '3',
  words: {
    "=": [{"id": "assignment", "initial": "{ value: 1 }" }],
    /*
    " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }" }],
    "one": [{"id": "number", "initial": "{ value: 1 }" }],
    "ten": [{"id": "number", "initial": "{ value: 10 }" }],
    */
  },

  generators: [
    [ ({context}) => context.marker == 'assignment' && context.paraphrase, ({context}) => `let ${context.variable.value} = ${context.value.value}` ],
    [ ({context}) => context.marker == 'assignment' && context.response, ({context}) => `${context.variable.value} == ${context.value.value}` ],
  ],

  semantics: [
    [
      ({context}) => context.marker == 'assignment',
      ({context, objects}) => {
        objects.variables[context.variable.marker] = context.value.marker
        context.response = true
      }
    ]
  ],
};

config = new entodicton.Config(config)
config.add(dialogues)

config.initializer( ({objects, api, uuid}) => {
  objects.variables = {}
})

entodicton.knowledgeModule( { 
  module,
  description: 'javascript interpreter',
  config,
  test: './javascript.test',
})
