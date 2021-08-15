const entodicton = require('entodicton')
const { dialogues } = require('ekms')

let config = {
  name: 'crew',
  operators: [
    "([arm] (<the> ([weapon|phasers])))"
  ],
  bridges: [
    { id: 'weapon', level: 0, bridge: "{ ...next(operator) }" },
    { id: 'arm', level: 0, bridge: "{ ...next(operator), weapon: after[0] }" },
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
  ]
}

config = new entodicton.Config(config)
config.add(dialogues)

entodicton.knowledgeModule( { 
  module,
  name: 'crew',
  description: 'crew',
  config,
  test: './crew.test',
})
