const entodicton = require('entodicton')
const hierarchy = require('./hierarchy')
const people_tests = require('./people.test.json')
const people_instance = require('./people.instance.json')
const { hashIndexesGet, hashIndexesSet, translationMapping, translationMappings, compose } = require('./helpers/meta.js')


// TODO first name 
// TODO last name
// hana is a first name vs hana is a person
// TODO who is the person that owns cleo

const template = {
    queries: [
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
config.initializer( ({config, context, km, isModule}) => {
  const api = km('properties').api
  // setup paraphrase
  api.createActionPrefix({
            operator: 'owns',
            word: { singular: 'owns', plural: 'own' },
            create: ['owns', 'owner', 'ownee'],
            before: [{tag: 'owner', id: 'owner'}],
            after: [{tag: 'ownee', id: 'ownee'}],
            relation: true,
            doAble: true,
            edAble: { operator: 'owned', word: 'owned' },
            config
          })
  config.addFragments(["ownerVar is owneeVar owned by", "owneeVar is owned by ownerVar"])

  // node people -q 'cleo is owned by kia who is cleo owned by' -d -g
  //  who is cleo owned by
  //    cleo is owned by kia
  //    the owner that owns ownee
  //    owner owns ownee is owner

  /*
  const matchByMarker = (defContext) => ({context}) => context.marker == defContext.from.marker && !context.query && !context.objects
  const matchByValue = (defContext) => ({context}) => context.value == defContext.from.value && !context.query && !context.objects
  const apply = (mappings, TO) => ({context, s}) => {
    TO = _.cloneDeep(TO)
    for (let { from, to } of mappings) {
      hashIndexesSet(TO, to, hashIndexesGet(context, from))
    }
    toPrime = s(TO)
    context.result = toPrime.result
  }
  const mappings = translationMapping(context.from, context.to)
  let match = matchByMarker(context)
  if (context.from.value) {
    match = matchByValue(context)
  }
  */

  /*
    TODO fix this when using translationMappings -> '[[{"from":["one"],"to":["0","owner"]},{"from":["two"],"to":["0","ownee"]}]]'
    [{"from":["one"],"to":["owner"]},{"from":["two"],"to":["ownee"]},{"from":["number"],"to":["number"]}]

    const mappings = [
              {
                match: ({context}) => context.value == 'property1',
                apply: ({context}) => Object.assign(context, { word: propertyContext.word, value: propertyContext.value, paraphrase: true }),
              },
              {
                match: ({context}) => context.value == 'object1',
                apply: ({context}) => {
                  Object.assign(context, { word: objectContext.word, value: objectContext.value, paraphrase: true })
                },
              },
              {
                match: ({context}) => context.value == 'value1',
                apply: ({context}) => Object.assign(context, value),
              },
            ]

  */
  const translationMappingToInstantiatorMappings = (translationMapping, from , to) => {
    return translationMapping.map( (tm) => {
      return {
        // match: ({context}) => context.value == to[tm.to].value,
        match: ({context}) => context[tm.to],
        apply: ({context}) => {
          // Object.assign(context[tm.to], from[tm.from])
          // debugger;
          context[tm.to] = from[tm.from]
          if (context[tm.to]) {
            context[tm.to].instantiated = true
          }
        }
      }
    })
  }

  /*
  const compose = (m1, m2) => {
  }
      const m1 = '[{"from":["one"],"to":["two"]},{"from":["two"],"to":["one"]}]'
      m1 + m2 -> '[{"from":["one"],"to":["owner"]},{"from":["two"],"to":["ownee"]},{"from":["number"],"to":["number"]}]'
      output
          '[{"from":["two"],"to":["owner"]},{"from":["one"],"to":["ownee"]},{"from":["number"],"to":["number"]}]'
  */

  const generator = {
    notes: `generator for who/what is X owned by`,
    // match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.one && context.one.marker == 'ownee' && context.one.constraints && context.one.constraints[0] && context.one.constraints[0].constraint.marker == 'owned' && context.two.value && context.two.value.marker !== 'answerNotKnown',
    match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.one && context.one.marker == 'ownee' && context.one.constraints && context.one.constraints[0] && context.one.constraints[0].constraint.marker == 'owned' && context.one.constraints[0].constraint.owner.implicit,
    // apply: apply(mappings, _.cloneDeep(context.to)),
    apply: ({context, g, callId}) => {
      const isToFromM = [{"from":["one"],"to":["two"]},{"from":["two"],"to":["one"]}]
      const fromF = config.fragment("ownerVar is owneeVar owned by").contexts()[0]
      const toF = config.fragment("owneeVar is owned by ownerVar")
      const to = toF.contexts()[0]
      const tm = translationMapping(fromF, to)
      /*
      some kind of compose
      const isToFromM = '[{"from":["one"],"to":["two"]},{"from":["two"],"to":["one"]}]'
      isToFromM + tm -> '[{"from":["one"],"to":["owner"]},{"from":["two"],"to":["ownee"]},{"from":["number"],"to":["number"]}]'
      output
          '[{"from":["two"],"to":["owner"]},{"from":["one"],"to":["ownee"]},{"from":["number"],"to":["number"]}]'
      */
      const tmPrime = compose(isToFromM, tm)
      // const from = context.one.constraints[0].constraint
      const from = context
      const im = translationMappingToInstantiatorMappings(tmPrime, from, to) 
      const translation = toF.instantiate(im)
      return g(translation)
    }
  }
  config.addGenerator(generator)

  // get fragments
  // add generator using fragments
  // config.addOperator("(([ownee])? <owned> ([by] ([owner])))")
  /*
  config.addBridge({
           id: "owned", 
           level: 0,
           bridge: "{ ...before, constraints: [ { property: 'ownee', constraint: { ...next(operator), owner: after[0].object, ownee: before[0] } } ] }",
           deferred: "{ ...next(operator), 'isEd': true, 'ownee': before[0], owner: after[0].object }" })
           // deferred: "{ ...next(operator), 'marker': 'owns', 'isEd': true, 'ownee': before[0], owner: after[0].object }" })
  */
  // config.addBridge({ id: "by", level: 0, bridge: "{ ...next(operator), object: after[0] }"})
  // config.addHierarchy('owned', 'isEdAble')
  /*
  config.addGenerator({
    match: ({context}) => {
      if (context.marker == 'owns' && context.paraphrase) {
        if (context['do']) {
          const left = context['do'].left
          if (context[left]) {
            // who owns X should not be 'does who own x' but instead 'who owns x'
            if (context[left].query) {
              return true;
            }
          }
        }
      }

      return false;
    },
    apply: ({context, g}) => {
      return `${g(context.owner)} owns ${g(context.ownee)}`
    }
  })
  */
  /*
  config.addGenerator({
    // match: ({context}) => context.marker == 'owns' && context.isEd,
    match: ({context}) => context.marker == 'owned' && context.isEd,
    apply: ({context, g}) => {
      return `${g(context.ownee)} is owned by ${g(context.owner)}`
    }
  })
  */
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
