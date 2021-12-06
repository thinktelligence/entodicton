const entodicton = require('entodicton')
const base = require('./avatar').copy()
const kirk_tests = require('./kirk.test.json')
const kirk_instance = require('./avatar.kirk.instance.json')

const config = new entodicton.Config({ 
  name: 'kirk',
  operators: [ "(<photon> ([torpedo|]))"],
  bridges: [
    { id: 'photon', level: 0, bridge: "{ ...after, photon: operator, value: concat('photon_', after.value), modifiers: append(['photon'], after[0].modifiers)}" },
    { id: 'torpedo', level: 0, bridge: "{ ...next(operator), value: 'torpedo' }" },
  ],
  hierarchy: [
    ['torpedo', 'theAble'],
    ['torpedo', 'queryable'],
  ],
  priorities: [
    [['torpedo', 0], ['photon', 0]],
    [['is', 0], ['the', 0], ['propertyOf', 0], ['photon', 0]],
    [['is', 0], ['photon', 0], ['propertyOf', 0], ['the', 0], ['what', 0], ['unknown', 0], ['torpedo', 0]],
  ],
  words: {
    "torpedo": [{ id: 'torpedo', initial: "{ value: 'torpedo' }"}],
    "torpedoes": [{ id: 'torpedo', initial: "{ value: 'torpedo' }"}],
  },
})
config.add(base)
kirk_instance.base = 'avatar'
config.load(kirk_instance)

entodicton.knowledgeModule( {
  module,
  description: 'kirk related concepts',
  config,
  test: {
          name: './kirk.test.json',
          contents: kirk_tests
        },
})
