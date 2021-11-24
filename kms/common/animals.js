#!/usr/bin/env node

const entodicton = require('entodicton')
const config = require('./hierarchy')
const animals_tests = require('./animals.test.json')
const animals_instance = require('./hierarchy.animals.instance.json')

config.load(animals_instance)
config.name = 'animals'

entodicton.knowledgeModule( {
    module,
      description: 'animals related concepts',
      config,
      test: {
              name: './animals.test.json',
              contents: animals_tests
            },
})
