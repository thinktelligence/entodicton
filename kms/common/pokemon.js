const entodicton = require('entodicton')
const hierarchy = require('./hierarchy')
const pokemon_tests = require('./pokemon.test.json')
const pokemon_instance = require('./pokemon.instance.json')
const pluralize = require('pluralize')

const template = {
  queries: [
    'pikachu squirtle weedle and pidgeot are pokemon',
    "fire is a pokemon type",
    "water is a pokemon type",
    "pikachu's type is electric",
  ],
};

// 'what are the pokemon types' -s do the save bug
// 'what are the types of pokemon'
// 'what is pikachu's type'
// 'ashe owns pikachu who owns pikachu'
// TODO does ashe own pikachu / ash owns pikachu? / 'ashe likes pikachu does ashe like pikachu'

const config = new entodicton.Config({ 
  name: 'pokemon',
  hierarchy: [
    ['pokemon', 'theAble'],
    ['pokemon', 'queryable'],
  ],
})
config.add(hierarchy)
config.initializer( ({config, km}) => {
  const api = km('properties').api
  api.kindOfConcept({ config, modifier: 'pokemon', object: 'type' })
  api.createActionPrefix({
              operator: 'owns',
              create: ['owns'],
              before: [{tag: 'owner', id: 'object'}],
              after: [{tag: 'owned', id: 'object'}],
              relation: true,
              config 
            })
  api.createActionPrefix({
              operator: 'likes',
              create: ['likes'],
              before: [{tag: 'liker', id: 'object'}],
              after: [{tag: 'likee', id: 'object'}],
              relation: true,
              config 
            })
})
config.load(template, pokemon_instance)
entodicton.knowledgeModule( {
  module,
  description: 'Knowledge about the pokemon using a KM template',
  config,
  test: {
          name: './pokemon.test.json',
          contents: pokemon_tests,
        },
})
