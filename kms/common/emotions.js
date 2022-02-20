const entodicton = require('entodicton')
const hierarchy = require('./hierarchy').copy()
entodicton.ensureTestFile(module, 'emotions', 'test')
entodicton.ensureTestFile(module, 'emotions', 'instance')
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
    "sentientBeing1 feels emotion1 means the emotion of sentientBeing1 is emotion1",
    //"greg feels angry", 
  ],
}

const config = new entodicton.Config({ 
  name: 'emotions',
  operators: [
    "([sentientBeing|])",
    "([emotion|])",
  ],
  bridges: [
    { id: 'sentientBeing', level: 0, bridge: '{ ...next(operator) }' },
    // just here so it loads and the sentence can make the semantics
    { id: 'feel', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'emotion', level: 0, bridge: '{ ...next(operator) }' },
  ],
  hierarchy: [
    ['emotion', 'unknown'],
    ['sentientBeing', 'unknown'],
  ]
})
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
config.load(template, emotions_instance)

entodicton.knowledgeModule( {
    module,
      description: 'emotions related concepts',
      config,
      test: {
              name: './emotions.test.json',
              contents: emotions_tests
            },
})
