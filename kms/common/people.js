const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const people_tests = require('./people.test.json')

// TODO first name 
// TODO last name
// hana is a first name vs hana is a person

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

config = new entodicton.Config(config)
config.add(dialogues)

entodicton.knowledgeModule( { 
  module,
  description: 'about people',
  config,
  test: {
    name: './people.test.json',
    contents: people_tests
  },
})
