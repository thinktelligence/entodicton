const entodicton = require('entodicton')
const hierarchy = require('./hierarchy').copy()
const ordering_tests = require('./ordering.test.json')
const ordering_instance = require('./ordering.instance.json')
const { API } = require('./helpers/ordering')

const template ={
  "queries": [
  ],
}

const api = new API();

/*
  what do you think about banana
  do you like 
  what do you like more than bananas
  i prefer apples to bananas                  bananas < apples
  i prefer apples over bananas                bananas < apples
  which do you prefer apples or banana        bananas ? apples
  what do you know about the speed of ...
  love is a kind of like
  hate is a kind of dislike
  who is cleo's owner
*/
const config = new entodicton.Config({ name: 'ordering' })
config.api = api
config.add(hierarchy)
config.load(template, ordering_instance)

config.initializer(({config, km}) => {
  const oapi = km('ordering').api
  oapi.createOrdering({ name: 'preference', categories: [ ['love', 'like'], ['hate', 'dislike'] ], ordering: [ ['love', 'like'], ['like', 'dislike'], ['dislike', 'hate'] ] })

  const papi = km('properties').api
  /*
  papi.createActionPrefix({
              operator: 'can',
              create: ['can'],
              before: [{tag: 'actor', id: 'object'}],
              after: [{tag: 'ability', id: 'object'}],
              relation: true,
              config
            })
  */
  papi.createActionPrefix({
              operator: 'love',
              create: ['love'],
              before: [{tag: 'lover', id: 'object'}],
              after: [{tag: 'lovee', id: 'object'}],
              ordering: {
                name: 'preference',
                marker: 'love',
                object: 'lover',
                category: 'lovee',
              },
              doAble: true,
              config
            })
  papi.createActionPrefix({
              operator: 'like',
              create: ['like'],
              before: [{tag: 'liker', id: 'object'}],
              after: [{tag: 'likee', id: 'object'}],
              ordering: {
                name: 'preference',
                marker: 'like',
                object: 'liker',
                category: 'likee',
              },
              doAble: true,
              config
            })
  papi.createActionPrefix({
              operator: 'dislike',
              create: ['dislike'],
              before: [{tag: 'disliker', id: 'object'}],
              after: [{tag: 'dislikee', id: 'object'}],
              ordering: {
                name: 'preference',
                marker: 'dislike',
                object: 'disliker',
                category: 'dislikee',
              },
              doAble: true,
              config
            })
  papi.createActionPrefix({
              // pattern: [ {tag: 'hater', id: 'object'}, { operator, create: true, relation: true }, {tag: 'hatee', id: 'object'} ],
              operator: 'hate',
              create: ['hate'],
              before: [{tag: 'hater', id: 'object'}],
              after: [{tag: 'hatee', id: 'object'}],
              ordering: {
                name: 'preference',
                marker: 'hate',
                object: 'hater',
                category: 'hatee',
              },
              doAble: true,
              // negation: 'likes',
              config
            })
  /* 
  papi.createActionPrefix({
              operator: 'own',
              create: ['own'],
              before: [{tag: 'owner', id: 'object'}],
              after: [{tag: 'ownee', id: 'object'}],
              relation: true,
              config
            })
  */
})

entodicton.knowledgeModule( {
    module,
      description: 'ordering related concepts',
      config,
      test: {
              name: './ordering.test.json',
              contents: ordering_tests
            },
})
