const pluralize = require('pluralize')

class API {
  /*
    for example, "I bought a car" => { before: 'person'], operator: 'buy', words: ['bought'], after: ['car']) }
    actionPrefix({before, operator, words, after, semantic}) {
  */

  setupObjectHierarchy(config, id, { types } = {}) {
    for (let type of types) {
      config.addHierarchy(id, type)
    }
  }

  // word is for one or many
  makeObject({config, context, types: [], doPluralize=true} = {}) {
    if (!context.unknown) {
      return context.value
    }
    const { word, value, number } = context;
    const concept = pluralize.singular(value)
    config.addOperator({ pattern: `([${concept}])`, allowDups: true })
    config.addBridge({ id: concept, level: 0, bridge: "{ ...next(operator) }" , allowDups: true })

    const addConcept = (word, number) => {
      config.addWord(word, { id: concept, initial: `{ value: "${concept}", number: "${number}" }` } )

			const baseTypes = [
				'theAble',
				'queryable',
				// 'hierarchyAble',
				// 'object',
				'isEdee',
				'isEder',
				// 'property'
			];

      const allTypes = new Set(baseTypes.concat(types))

      this.setupObjectHierarchy(config, concept, { allTypes } );
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
