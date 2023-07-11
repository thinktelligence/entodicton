const pluralize = require('pluralize')

class API {
  /*
    for example, "I bought a car" => { before: 'person'], operator: 'buy', words: ['bought'], after: ['car']) }
    actionPrefix({before, operator, words, after, semantic}) {
  */

  setupObjectHierarchy(config, id, { include_concept=true  } = {}) {
    config.addHierarchy(id, 'theAble')
    config.addHierarchy(id, 'queryable')
    config.addHierarchy(id, 'hierarchyAble')
    config.addHierarchy(id, 'object')
    if (include_concept) {
      config.addHierarchy(id, 'concept')
    }
    config.addHierarchy(id, 'isEdee')
    config.addHierarchy(id, 'isEder')
    config.addHierarchy(id, 'property')
  }

  // word is for one or many
  makeObject({config, context, doPluralize=true}) {
    if (!context.unknown) {
      return context.value
    }
    const { word, value, number } = context;
    const concept = pluralize.singular(value)
    config.addOperator({ pattern: `([${concept}])`, allowDups: true })
    config.addBridge({ id: concept, level: 0, bridge: "{ ...next(operator) }" , allowDups: true })

    const addConcept = (word, number) => {
      config.addWord(word, { id: concept, initial: `{ value: "${concept}", number: "${number}" }` } )
      this.setupObjectHierarchy(config, concept);
    }

    if (pluralize.isSingular(word)) {
      addConcept(word, 'one')
      doPluralize && addConcept(pluralize.plural(word), 'many')
    } else {
      doPluralize && addConcept(pluralize.singular(word), 'one')
      addConcept(word, 'many')
    }

    // mark greg as an instance?
    // add a generator for the other one what will ask what is the plural or singluar of known
    /*
    if (number == 'many') {
    } else if (number == 'one') {
    }
    */
    return concept;
  }
}

module.exports = {
  API,
}
