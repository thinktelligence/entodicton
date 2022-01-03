const pluralize = require('pluralize')

class API {

  // actionPrefix({before, operator, words, after, semantic, create})
  //
  // before == [ { tag, marker }, ... ]
  // create == [ id, ... ] // ids to create bridges for
  createActionPrefix(config, semanticApply) {
    const operator = 'arm'
    const before = []
    const after = [{tag: 'weapon', id: 'weapon'}]
    const create = ['arm', 'weapon']

    const beforeOperators = before.map( (arg) => `([${arg.id}|])` ).join('')
    const afterOperators = after.map( (arg) => `([${arg.id}|])` ).join('')
    config.addOperator(`(${beforeOperators} [${operator}|] ${afterOperators})`)
   
    create.map( (id) => {
      if (id === operator) {
        const tagsToProps = (where, args) => {
          let i = 0;
          let r = ''
          for (let arg of args) {
            r += `${arg.tag}: ${where}[${i}] `
          }
          return r
        }
        // const beforeArgs = before.map( (arg) => `` ).join('')
        // const afterArgs = after.map( (arg) => `weapon: after[0]` ).join('')
        const beforeArgs = tagsToProps('before', before)
        const afterArgs = tagsToProps('after', after)
        config.addBridge({ id: operator, level: 0, bridge: "{ ...next(operator), weapon: after[0] }"})
        config.addWord('arm', { id: operator, initial: `{ value: "${operator}" }` })
      } else {
        config.addBridge({ id: id, level: 0, bridge: "{ ...next(operator) }"})
      }
    })

    config.addGenerator({
      match: ({context}) => context.marker == operator && context.paraphrase,
      apply: ({context, g}) => `${context.word} ${g(context.weapon)}`
    })

    config.addSemantic({
      match: ({context}) => context.marker == operator,
      apply: semanticApply,
    })
  }

  // for example, "crew member" or "photon torpedo"
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

    // [['a', 0], ['crew', 0], ['is', 0], ['kirk', 0]]
    /*
    config.addPriorities([[objectId, 0], [modifierId, 0]])
    config.addPriorities([['a', 0], ['is', 0], [modifierId, 0]])
    config.addPriorities([['a', 0], ['is', 0], [objectId, 0]])
    config.addPriorities([['the', 0], ['is', 0], [modifierId, 0]])
    config.addPriorities([['the', 0], ['is', 0], [objectId, 0]])
    */
    config.addPriorities([['a', 0], [modifierId, 0]])
    config.addPriorities([['a', 0], [objectId, 0]])
    config.addPriorities([['the', 0], [modifierId, 0]])
    config.addPriorities([['the', 0], [objectId, 0]])
    /*
    config.addPriorities([['is', 0], [modifierId, 0]])
    config.addPriorities([['is', 0], [objectId, 0]])
    config.addPriorities([['is', 0], ['the', 0], ['propertyOf', 0], [modifierId, 0]])
    config.addPriorities([['is', 0], [modifierId, 0], ['propertyOf', 0], ['the', 0], ['what', 0], ['unknown', 0], [objectId, 0]])
    */
  }

  /*
  // for example, "I bought a car" => { before: 'person'], operator: 'buy', words: ['bought'], after: ['car']) }
  actionPrefix({before, operator, words, after, semantic}) {

  }
  */

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

  copyShared(fromApi) {
    debugger;
    for (let {args, handler} of fromApi.objects.initHandlers) {
      this.setShared(handler, ...args)
    }
  }

  setShared(handler, ...args) {
    if (!handler) {
      handler = new Object({
        setProperty: (object, property, value, has) => {
          return this.setPropertyDirectly(object, property, value, has)
        },
        getProperty: (object, property) => {
          return this.getPropertyDirectly(object, property)
        },
      })
    }
    this.setHandler(handler, ...args)
    this.objects.initHandlers.push( { args, handler } )
    return handler
  }

  setReadOnly(...args) {
    const handler = new Object({
      setProperty: (object, property, value, has) => {
        const error = Error(`The property '${property}' of the object '${object}' is read only`)
        error.code = 'ReadOnly'
        throw error
      },
      getProperty: (object, property) => {
        return this.getPropertyDirectly(object, property)
      },
    })
    this.setHandler(handler, ...args)
  }

  setHandler(handler, ...args) {
    let where = this.objects.handlers
    for (let arg of args.slice(0, args.length-1)) {
      if (!where[arg]) {
        where[arg] = {}
      }
      where = where[arg]
    }
    where[args[args.length-1]] = handler
    //handler.api = this
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
    if ((this.objects.handlers || {})[object]) {
      if ((this.objects.handlers[object] || {})[property]) {
        return this.objects.handlers[object][property].getProperty(object, property)
      } else {
        return this.objects.handlers[object].getProperty(object, property)
      }
    }
    return this.getPropertyDirectly(object, property, g)
  }

  getPropertyDirectly(object, property, g) {
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

  setProperty(object, property, value, has, skipHandler) {
    if (!skipHandler) {
      if ((this.objects.handlers || {})[object]) {
        if ((this.objects.handlers[object] || {})[property]) {
          return this.objects.handlers[object][property].setProperty(object, property, value, has)
        } else {
          return this.objects.handlers[object].setProperty(object, property, value, has)
        }
      }
    }

    this.setPropertyDirectly(object, property, value, has, skipHandler)
  }
  
  setPropertyDirectly(object, property, value, has, skipHandler) {
    this.getObject(object)[property] = {has, value} || undefined
    if (has && value) {
      let values = this.objects.property[property] || []
      if (!values.includes(value)) {
        values = values.concat(value)
      }
      this.objects.property[property] = values
      // this.objects.property[property] = (this.objects.property[property] || []).concat(value)
      // "mccoy's rank is doctor",
      // infer doctor is a type of rank
      this.rememberIsA(value.value, property);
    }
    if (!this.objects.concepts.includes(object)) {
      this.objects.concepts.push(pluralize.singular(object))
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

  initialize(objects) {
    objects.concepts = []
    // object -> property -> {has, value}
    objects.properties = {}
    // property -> values
    objects.property = {}
    objects.handlers = {}
    objects.initHandlers = []
    objects.parents = {}
    objects.children = {}
  }

}

module.exports = {
  API
}
