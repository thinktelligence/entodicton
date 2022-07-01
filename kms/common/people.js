const entodicton = require('entodicton')
const hierarchy = require('./hierarchy')
const people_tests = require('./people.test.json')
const people_instance = require('./people.instance.json')


// TODO first name 
// TODO last name
// hana is a first name vs hana is a person

const template = {
    "queries": [
      "first modifies name",
      "last modifies name",
      "surname means last name",
      "given modifies name",
      "given name means first name",
      "ownee is owned by owner means owner owns ownee",
    ],
}
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

config = new entodicton.Config(config, module)
config.add(hierarchy)
config.initializer( ({config, context, km}) => {
  const api = km('properties').api
  api.createActionPrefix({
            operator: 'owns',
            create: ['owns', 'owner', 'ownee'],
            before: [{tag: 'owner', id: 'owner'}],
            after: [{tag: 'ownee', id: 'ownee'}],
            relation: true,
            doAble: true,
            config
          })
  config.addOperator("(([ownee])? <owned> ([by] ([owner])))")
  config.addBridge({
           id: "owned", 
           level: 0,
           bridge: "{ ...before, contraints: [ { property: 'ownee', constraint: { ...next(operator), owner: after[0].object, ownee: before[0] } } ] }",
           deferred: "{ ...next(operator), 'isEd': true, 'ownee': before[0], owner: after[0].object }" })
           // deferred: "{ ...next(operator), 'marker': 'owns', 'isEd': true, 'ownee': before[0], owner: after[0].object }" })
  config.addBridge({ id: "by", level: 0, bridge: "{ ...next(operator), object: after[0] }"})
  config.addHierarchy('owned', 'isEdAble')
  config.addGenerator({
    // match: ({context}) => context.marker == 'owns' && context.isEd,
    match: ({context}) => context.marker == 'owned' && context.isEd,
    apply: ({context, g}) => {
      return `${g(context.ownee)} is owned by ${g(context.owner)}`
    }
  })
  // config.addBridge({ id: "ownee", level: 0, bridge: "{ ...next(operator) }"})
  // config.addBridge({ id: "owner", level: 0, bridge: "{ ...next(operator) }"})

})

entodicton.knowledgeModule( { 
  module,
  description: 'about people',
  config,
  test: {
    name: './people.test.json',
    contents: people_tests
  },
  template: {
    template,
    instance: people_instance
  },
})
