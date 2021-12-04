const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const properties = require('./properties')
const avatar_tests = require('./avatar.test.json')
 
let config = {
  name: 'avatar',

  words: {
    "my": [{ id: 'objectPrefix', initial: "{ value: 'other' }" }],
    "your": [{ id: 'objectPrefix', initial: "{ value: 'self' }" }],
  }
};

config = new entodicton.Config(config)
config.add(properties)

entodicton.knowledgeModule( { 
  module,
  description: 'avatar for dialogues',
  config,
  test: {
    name: './avatar.test.json',
    contents: avatar_tests
  }
})
