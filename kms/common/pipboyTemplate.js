const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const base_km = require('./hierarchy')
const countable = require('./countable')
const comparable = require('./comparable')
const pipboyTemplate_tests = require('./pipboyTemplate.test.json')
const pipboyTemplate_instance = require('./pipboyTemplate.instance.json')

const template = {
  queries: [
    "pistols rifles grenades mines and shotguns are weapons",
    "mines and grenades are explosives",
    "explosives are weapons",
    "pistols rifles and shotguns are firearms",
    "firearms are weapons",
    "hats and suits are clothes",
    // "a rifle is a weapon",
    //"a weapon is equipable and changeable"
    "a weapon is equipable",
    "clothes are wearable",
    // "weapons are countable",  TODO fix this
    "food is edible",
    "drinks are drinkable",
    "meat is food",
    "vegetables and fruit are food",
    "cola and pop are drinks",
    "medicine and stimpaks are takeable",
    "damage luck hp rads value ap charisma range and accuracy are properties"
  ] 
}

let config = {
  name: 'pipboyTemplate',
};

config = new Config(config, module)
config.add(base_km).add(countable).add(comparable)

knowledgeModule({ 
  module,
  description: 'Template for pipboy with speech',
  config,
  template: {
    template,
    instance: pipboyTemplate_instance
  },
  test: {
    name: './pipboyTemplate.test.json',
    contents: pipboyTemplate_tests
  },
})
