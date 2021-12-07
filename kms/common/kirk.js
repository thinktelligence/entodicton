const entodicton = require('entodicton')
const base = require('./avatar').copy()
const kirk_tests = require('./kirk.test.json')
const kirk_instance = require('./avatar.kirk.instance.json')
const pluralize = require('pluralize')

const modifier = (config, modifier, object) => {
  const objectId = pluralize.singular(object)
  const modifierId = pluralize.singular(modifier)

  const objectSingular = pluralize.singular(object)
  const objectPlural = pluralize.plural(object)
  config.addOperator(`(<${modifierId}> ([${objectId}|]))`)

  config.addWord(objectSingular, { id: objectId, initial: `{ value: '${objectId}' }`})
  config.addWord(objectPlural, { id: objectId, initial: `{ value: '${objectId}' }`})

  config.addBridge({ id: modifierId, level: 0, bridge: `{ ...after, ${modifierId}: operator, value: concat('${modifierId}_', after.value), modifiers: append(['${modifierId}'], after[0].modifiers)}` })
  config.addBridge({ id: objectId, level: 0, bridge: `{ ...next(operator), value: '${objectId}' }` })

  config.addHierarchy(objectId, 'theAble')
  config.addHierarchy(objectId, 'queryable')

  config.addPriorities([['torpedo', 0], ['photon', 0]])
  config.addPriorities([['is', 0], ['the', 0], ['propertyOf', 0], ['photon', 0]])
  config.addPriorities([['is', 0], ['photon', 0], ['propertyOf', 0], ['the', 0], ['what', 0], ['unknown', 0], ['torpedo', 0]])
}

const config = new entodicton.Config({ 
  name: 'kirk',
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
