const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const hierarchy = require('./hierarchy')
const pokemon_tests = require('./pokemon.test.json')
const pokemon_instance = require('./pokemon.instance.json')
const pluralize = require('pluralize')

const template = {
  queries: [
    "pokemon modifies type",
    "pokemon type is a type",
    "pikachu squirtle weedle and pidgeot are pokemon",
    "fire modifies type",
    "water modifies type",
    "earth modifies type",
    "electric modifies type",
    "fire type is a pokemon type",
    "water type is a pokemon type",
    "electric type is a pokemon type",
    "earth type is a pokemon type",
    "pikachu is an electric type",
    "charmander is a fire type",
  ],
};

// 'what are the pokemon types' -s do the save bug
// 'what are the types of pokemon'
// 'what is pikachu's type'
// 'ashe owns pikachu who owns pikachu'
// TODO does ashe own pikachu / ash owns pikachu? / 'ashe likes pikachu does ashe like pikachu'

const config = new Config({ 
  name: 'pokemon',
  hierarchy: [
    // ['pokemon', 'theAble'],
    // ['pokemon', 'theAble'],
    // ['pokemon', 'queryable'],
    // ['pokemon', 'whatAble'],
  ],
  /*
  associations: {
   positive: [[['what', 0], ['type', 0], ['is', 0], ['pokemon', 0]]]
  },
  */
})
config.add(hierarchy)
config.initializer( ({config, km}) => {
  const api = km('properties').api
  // api.kindOfConcept({ config, modifier: 'pokemon', object: 'type' })
  /*
  api.createActionPrefix({
              operator: 'owns',
              create: ['owns'],
              before: [{tag: 'owner', id: 'object'}],
              after: [{tag: 'owned', id: 'object'}],
              relation: true,
              config 
            })
  */
  api.createActionPrefix({
              operator: 'likes',
              create: ['likes'],
              before: [{tag: 'liker', id: 'object'}],
              after: [{tag: 'likee', id: 'object'}],
              relation: true,
              config 
            })
})
// config.load(template, pokemon_instance)
knowledgeModule( {
  module,
  description: 'Knowledge about the pokemon using a KM template',
  config,
  test: {
          name: './pokemon.test.json',
          contents: pokemon_tests,
        },
  template: {
    template,
    instance: pokemon_instance,
  },
})
