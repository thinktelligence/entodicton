const { Config, knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
const avatar = require('./avatar')
const animals = require('./animals')
const ordering = require('./ordering')
const foods = require('./foods')
ensureTestFile(module, 'kid', 'test')
ensureTestFile(module, 'kid', 'instance')
const kid_tests = require('./kid.test.json')
const kid_instance = require('./kid.instance.json')
const pluralize = require('pluralize')

const template = {
  queries: [
    // TODO "owns is relation between owner and owned",
    // TODO how old is alice
    "wendy's sister is alice",
    "wendy's name is wendy",
    "wendy's age is 27",
    "alice's sister is wendy",
    "alice's name is alice",
    "alice's age is 21",
    "wendy loves chicken strips",
    "wendy hates sushi",
    "alice likes chicken strips",
    "alice dislikes sushi",
    "hanna means alice",
    "wendy's cat is cleo",
  ]
};

const config = new Config({ name: 'kid', }, module)

config.add(avatar)
config.add(animals)
config.add(foods)
config.add(ordering)
// config.load(template, kid_instance)
knowledgeModule({
  module,
  description: 'KM for my kids',
  config,
  test: {
          name: './kid.test.json',
          contents: kid_tests,
        },
  template: {
    template,
    instance: kid_instance,
  },
})
