const entodicton = require('entodicton')
const hierarchy = require('./hierarchy')
const people_tests = require('./people.test.json')
const people_instance = require('./people.instance.json')


// TODO first name 
// TODO last name
// hana is a first name vs hana is a person

const template = {
    "queries": [
      "first modifies name",
      "last modifies name",
      "surname means last name",
      "given modifies name",
      "given name means first name",
    ],
}
let config = {
  name: 'people',
  operators: [
    "([person|person,people])"
  ],
  bridges: [
    { id: 'person', level: 0, bridge: '{ ...next(operator) }' },
  ],
  hierarchy: [
    ['person', 'unknown'],
  ]
};

config = new entodicton.Config(config, module)
config.add(hierarchy)

entodicton.knowledgeModule( { 
  module,
  description: 'about people',
  config,
  test: {
    name: './people.test.json',
    contents: people_tests
  },
  template: {
    template,
    instance: people_instance
  },
})
