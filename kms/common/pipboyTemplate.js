const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const base_km = require('./hierarchy')
const countable = require('./countable')
const pipboyTemplate_tests = require('./pipboyTemplate.test.json')
const pipboyTemplate_instance = require('./pipboyTemplate.instance.json')

const template = {
  queries: [
    "pistols rifles grenades mines and shotguns are weapons",
    // "a rifle is a weapon",
    //"a weapon is equipable and changeable"
    "a weapon is equipable",
    // "weapons are countable",  TODO fix this
  ] 
}

let config = {
  name: 'pipboyTemplate',
};

config = new Config(config, module)
config.add(base_km).add(countable)

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
