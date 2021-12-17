const pluralize = require('pluralize')

class API {

  kindOfConcept(config, modifier, object) {
    const objectId = pluralize.singular(object)
    const modifierId = pluralize.singular(modifier)
    const modifierObjectId = `${modifierId}_${objectId}`

    const objectSingular = pluralize.singular(object)
    const objectPlural = pluralize.plural(object)
    config.addOperator(`(<${modifierId}> ([${objectId}|]))`)
    config.addOperator(`([${modifierObjectId}|])`)

    config.addWord(objectSingular, { id: objectId, initial: `{ value: '${objectId}' }`})
    config.addWord(objectPlural, { id: objectId, initial: `{ value: '${objectId}' }`})

    config.addBridge({ id: modifierId, level: 0, bridge: `{ ...after, ${modifierId}: operator, marker: operator(concat('${modifierId}_', after.value)), value: concat('${modifierId}_', after.value), modifiers: append(['${modifierId}'], after[0].modifiers)}` })
    config.addBridge({ id: objectId, level: 0, bridge: `{ ...next(operator), value: '${objectId}' }` })
    config.addBridge({ id: modifierObjectId, level: 0, bridge: `{ ...next(operator), value: '${modifierObjectId}' }` })

    config.addHierarchy(objectId, 'theAble')
    config.addHierarchy(objectId, 'queryable')
    config.addHierarchy(modifierObjectId, objectId)
    config.addHierarchy(objectId, 'concept')

    config.addPriorities([[objectId, 0], [modifierId, 0]])
    config.addPriorities([['is', 0], ['the', 0], ['propertyOf', 0], [modifierId, 0]])
    config.addPriorities([['is', 0], [modifierId, 0], ['propertyOf', 0], ['the', 0], ['what', 0], ['unknown', 0], [objectId, 0]])
  }

  // word is for one or many
  makeObject({config, context}) {
    const { word, value, number } = context;
    const concept = pluralize.singular(value)
    config.addOperator(`([${concept}])`)
    config.addBridge({ id: concept, level: 0, bridge: "{ ...next(operator) }" })

    const addConcept = (word, number) => {
      config.addWord(word, { id: concept, initial: `{ value: "${concept}", number: "${number}" }` } )
      config.addHierarchy(concept, 'theAble')
      config.addHierarchy(concept, 'queryable')
      config.addHierarchy(concept, 'hierarchyAble')
      config.addHierarchy(concept, 'object')
      config.addGenerator({
          match: ({context}) => context.value == concept && context.number == number && context.paraphrase,
          apply: () => word
      })
    }

    if (pluralize.isSingular(word)) {
      addConcept(word, 'one')
      addConcept(pluralize.plural(word), 'many')
    } else {
      addConcept(pluralize.singular(word), 'one')
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

  getObject(object) {
    if (!this.objects.properties) {
      this.objects.properties = {}
    }
    if (!this.objects.properties[object]) {
      this.objects.properties[object] = {}
    }
    return this.objects.properties[object]
  }

  getProperty(object, property, g) {
    if (property == 'properties') {
      const objectProps = this.getObject(object)
      const values = []
      for (let key of Object.keys(objectProps)) {
        if (objectProps[key].has) {
          values.push(`${g(key)}: ${g({ ...objectProps[key].value, evaluate: true })}`)
        }
      }
      return { marker: 'list', value: values }
    } else {
      return (this.objects.properties[object][property] || {}).value
    }
  }

  hasProperty(object, property, has) {
    this.getObject(object)[property].has
  }

  setProperty(object, property, value, has) {
    this.getObject(object)[property] = {has, value} || undefined
    if (has && value) {
      this.objects.property[property] = (this.objects.property[property] || []).concat(value)
      // "mccoy's rank is doctor",
      // infer doctor is a type of rank
      this.rememberIsA(value.value, property);
    }
    if (!this.objects.concepts.includes(object)) {
      this.objects.concepts.push(object)
    }
  }

  knownObject(object) {
    return !!this.objects.properties[object]
  }

  hasProperty(object, property) {
    if (property == 'properties') {
      return true;
    }

    // go up the hierarchy
    const todo = [object];
    const seen = [object];
    while (todo.length > 0) {
      const next = todo.pop();
      if (((this.objects.properties[next] || {})[property] || {}).has) {
        return true
      }
      const parents = this.objects.parents[next] || [];
      for (let parent of parents) {
        if (!seen.includes(parent)) {
          todo.push(parent)
          seen.push(parent)
        } 
      }
    }
    return false
  }

  knownProperty(object, property) {
    if (property == 'properties') {
      return true;
    }

    // go up the hierarchy
    const todo = [object];
    const seen = [object];
    while (todo.length > 0) {
      const next = todo.pop();
      if ((this.objects.properties[next] || {})[property] !== undefined) {
        return true
      }
      const parents = this.objects.parents[next] || [];
      for (let parent of parents) {
        if (!seen.includes(parent)) {
          todo.push(parent)
          seen.push(parent)
        } 
      }
    }
    return false
  }

  learnWords(config, context) {
  }
/*
  ensureDefault(map, key, default) {
    if (!this.objects[map][key]) {
      this.objects[map][key] = default
    }
    return this.objects[map][key]
  }

  pushListNoDups(list, value) {
    if (list.includes(value)) {
      return
    }
    list.push(value)
  }

  ensureConcept(concept) {
    ensureDefault(this.properties, concept, {})
    ensureDefault(this.concepts, concept, [])
  }

  canDo(object, ability) {
    this.ensureConcept(object)
    this.pushListNoDups(this.ensureList('abilities', object), ability)
  }
*/
  isA(child, ancestor) {
    // return this.objects.parents[child].includes(parent);
    const todo = [child];
    const seen = [child];
    while (todo.length > 0) {
      const next = todo.pop();
      if (next == ancestor) {
        return true
      }
      const parents = this.objects.parents[next] || [];
      for (let parent of parents) {
        if (!seen.includes(parent)) {
          todo.push(parent)
          seen.push(parent)
        } 
      }
    }
    return false
  }

  rememberIsA(child, parent) {
    if (!this.objects.parents[child]) {
      this.objects.parents[child] = []
    }
    if (!this.objects.parents[child].includes(parent)) {
      this.objects.parents[child].push(parent)
    }

    if (!this.objects.children[parent]) {
      this.objects.children[parent] = []
    }
    if (!this.objects.children[parent].includes(child)) {
      this.objects.children[parent].push(child)
    }

    if (!this.objects.concepts.includes(child)) {
      this.objects.concepts.push(child)
    }
    if (!this.objects.concepts.includes(parent)) {
      this.objects.concepts.push(parent)
    }

    if (!this.objects.properties[child]) {
      this.objects.properties[child] = {}
    }

    if (!this.objects.properties[parent]) {
      this.objects.properties[parent] = {}
    }
  }

  children(parent) {
    return this.objects.children[parent]
  }

  conceptExists(concept) {
    return this.objects.concepts.includes(concept)
  }

}

module.exports = {
  API
}
