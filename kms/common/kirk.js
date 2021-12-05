const entodicton = require('entodicton')
const base = require('./avatar').copy()
const kirk_tests = require('./kirk.test.json')
const kirk_instance = require('./avatar.kirk.instance.json')

const config = new entodicton.Config({ name: 'kirk' })
config.add(base)
config.load(kirk_instance)

entodicton.knowledgeModule( {
    module,
      description: 'Captain James T Kirk as a template generated from Avatar',
      config,
      test: {
              name: './kirk.test.json',
              contents: kirk_tests
            },
})
