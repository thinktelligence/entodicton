const entodicton = require('entodicton')
const base = require('./avatar').copy()
const kirk_tests = require('./kirk.test.json')
const kirk_instance = require('./avatar.kirk.instance.json')

const config = new entodicton.Config({ name: 'kirk' })
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
