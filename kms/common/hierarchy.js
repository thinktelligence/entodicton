const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const hierarchy_tests = require('./hierarchy.test.json')

const api = {
  isA(objects, child, parent) {
    if (!objects.parents[child]) {
      objects.parents[child] = []
    }
    if (!objects.parents[child].includes(parent)) {
      objects.parents[child].push(parent)
    }
  }
}
let config = {
  name: 'hierarchy',
  operators: [
  ],
  hierarchy: [
  ],
  bridges: [
  ],
  words: {
  },
  priorities: [
  ],
  generators: [
  ],
  semantics: [
    {
      notes: 'c is a y',
      match: ({context}) => context.marker == 'unknown' && !context.pullFromContext && !context.wantsValue && context.same && !context.same.pullFromContext && context.same.wantsValue,
      apply: ({context, api, objects}) => {
        api.isA(objects, context.value, context.same.value)
        context.sameWasProcessed = true
      },
    },
    {
      notes: 'an x is a y',
      match: ({context}) => context.marker == 'unknown' && !context.pullFromContext && context.wantsValue && context.same,
      apply: ({context, api, objects}) => {
        api.isA(objects, context.value, context.same.value) 
        context.sameWasProcessed = true
      }
    },
  ]
};

config = new entodicton.Config(config)
config.api = api
config.add(dialogues)
config.initializer( ({objects}) => {
  objects.parents = {
  }
})

entodicton.knowledgeModule( { 
  module,
  description: 'hierarchy of objects',
  config,
  test: {
    name: './hierarchy.test.json',
    contents: hierarchy_tests
  },
})

/* Random design notes
is greg a cat       fx fx    fxx
greg is a cat?
greg is a cat       fx xfi   xfy

is greg a cat joe a human and fred a dog


yfxx


1f00 == fxx -> xf
*/
