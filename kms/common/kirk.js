const entodicton = require('entodicton')
const base = require('./avatar').copy()
const kirk_tests = require('./kirk.test.json')
const kirk_instance = require('./avatar.kirk.instance.json')

const modifier = (config, modifier, object) => {
  config.addOperator(`(<${modifier}> ([${object}|]))`)

  config.addWord("torpedo", { id: object, initial: "{ value: 'torpedo' }"})
  config.addWord("torpedoes", { id: object, initial: "{ value: 'torpedo' }"})

  config.addBridge({ id: 'photon', level: 0, bridge: "{ ...after, photon: operator, value: concat('photon_', after.value), modifiers: append(['photon'], after[0].modifiers)}" })
  config.addBridge({ id: 'torpedo', level: 0, bridge: "{ ...next(operator), value: 'torpedo' }" })

  config.addHierarchy('torpedo', 'theAble')
  config.addHierarchy('torpedo', 'queryable')

/*
  config.addPriorities([['torpedo', 0], ['photon', 0]])
  config.addPriorities([['is', 0], ['the', 0], ['propertyOf', 0], ['photon', 0]])
  config.addPriorities([['is', 0], ['photon', 0], ['propertyOf', 0], ['the', 0], ['what', 0], ['unknown', 0], ['torpedo', 0]])
*/
}

const config = new entodicton.Config({ 
  name: 'kirk',
  priorities: [
    [['questionMark', 0], ['is', 1]],
    [['torpedo', 0], ['photon', 0]],
    [['is', 0], ['the', 0], ['propertyOf', 0], ['photon', 0]],
    [['is', 0], ['photon', 0], ['propertyOf', 0], ['the', 0], ['what', 0], ['unknown', 0], ['torpedo', 0]],
  ],
})
config.add(base)
kirk_instance.base = 'avatar'
config.load(kirk_instance)
config.initializer( ({config}) => {
  modifier(config, 'photon', 'torpedo')
} )

entodicton.knowledgeModule( {
  module,
  description: 'kirk related concepts',
  config,
  test: {
          name: './kirk.test.json',
          contents: kirk_tests,
          include: {
            words: true,
            bridges: true,
            operators: true,
            hierarchy: true,
            priorities: true,
          }
        },
})
