const { Config, knowledgeModule, ensureTestFile, where } = require('theprogrammablemind')
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
    // TODO how old is hana
    "kia's sister is hana",
    "kia's name is kia",
    "kia's age is 27",
    "hana's sister is kia",
    "hana's name is hana",
    "hana's age is 21",
    "kia loves chicken strips",
    "kia hates sushi",
    "hana likes chicken strips",
    "hana dislikes sushi",
    "hanna means hana",
    "kia's cat is cleo",
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
