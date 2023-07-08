const { Config, knowledgeModule, ensureTestFile, where } = require('entodicton')
const hierarchy = require('./hierarchy').copy()
ensureTestFile(module, 'emotions', 'test')
ensureTestFile(module, 'emotions', 'instance')
const emotions_tests = require('./emotions.test.json')
const emotions_instance = require('./emotions.instance.json')

/*
anger/angry
happiness/happy
okay/happy
boredom/bored
*/

const template ={
  "queries": [
    // "neutral anger happiness and boredom are concepts",
    // "neutral anger happiness and boredom are emotions",
    // TODO add an invert for mapping generator to "sb feels e"
    "sentientBeing1 feels emotion1 means the emotion of sentientBeing1 is emotion1",
    //"greg feels angry", 
  ],
}

const config = new Config({ 
  name: 'emotions',
  operators: [
    "([sentientBeing|])",
    "([emotion|])",
  ],
  bridges: [
    { id: 'sentientBeing', level: 0, bridge: '{ ...next(operator) }' },
    // just here so it loads and the sentence can make the semantics
    // { id: 'feel', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'emotion', level: 0, bridge: '{ ...next(operator) }' },
  ],
  priorities: [
    [['means', 0], ['feel', 0]]
  ],

  hierarchy: [
    ['emotion', 'unknown'],
    ['sentientBeing', 'unknown'],
  ]
}, module)
config.add(hierarchy)
config.initializer( ({config, km}) => {
  const api = km('properties').api
  api.createActionPrefix({
                operator: 'feel',
                create: ['feel'/*, 'emotion'*/],
                before: [{tag: 'sentientBeing', id: 'sentientBeing'}],
                after: [{tag: 'emotion', id: 'emotion'}],
                doAble: true,
                config })
})
//config.load(template, emotions_instance)

knowledgeModule( {
    module,
      description: 'emotions related concepts',
      config,
      test: {
              name: './emotions.test.json',
              contents: emotions_tests
            },
      template: {
        template,
        instance: emotions_instance,
      },
})
