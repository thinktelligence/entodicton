const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const dialogues = require('./dialogues')
const javascript_tests = require('./javascript.test.json')

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

  hierarchy: [
    ['variable', 'unknown']
  ],

  generators: [
    { 
      where: where(),
      match: ({context}) => context.marker == 'assignment' && context.paraphrase, 
      apply: ({context, g}) => `let ${g(context.variable)} = ${g(context.value)}` 
    },
    { 
      where: where(),
      match: ({context}) => context.marker == 'assignment' && context.isResponse, 
      apply: ({context, g}) => {
        const value = g(context.variable)
        return `${g(context.variable)} == ${g(context.value)}` 
      }
    },
  ],

  semantics: [
    {
      where: where(),
      match: ({context}) => context.marker == 'assignment',
      apply: ({context, objects}) => {
        objects.variables[context.variable.value] = context.value.value
        context.isResponse = true
      }
    }
  ],
};

config = new Config(config, module)
config.add(dialogues)

config.initializer( ({objects, api, uuid}) => {
  objects.variables = {}
})

knowledgeModule( { 
  module,
  description: 'javascript interpreter',
  config,
  test: {
    name: './javascript.test.json',
    contents: javascript_tests,
  },
})
