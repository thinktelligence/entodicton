const pluralize = require('pluralize')

class Frankenhash {
  constructor(root, handlers, initHandlers) {
    this.root = root
    this.handlers = handlers
    this.initHandlers = initHandlers
  }

  getValue(path, writeDefault=true) {
    let value = this.root
    for (let property of path) {
      if (!value[property]) {
        if (writeDefault) {
          value[property] = {}
        } else {
          return null
        }
      }
      value = value[property]
    }
    return value
  }

  isHandler(value) {
    return value && !!value.getProperty && !!value.setProperty
  }

  getHandler(path) {
    let value = this.handlers
    for (let property of path) {
      if (this.isHandler(value)) {
        return value
      }
      value = value || {}
      value = value[property]
    }
    return value
  }

  knownProperty(path) {
    let value = this.root;
    for (let property of path) {
      if (!value[property]) {
        return false
      }
      value = value[property]
    }
    return !!value
  }


  ensureValue(path, value, has=true) {
    if (!this.getValue(path)) {
      this.setValue(path, value, has)
    }
  }

  setValue(path, value, has) {
    const [object, property] = path
    const prefix = path.slice(0, path.length - 1)
    const last = path[path.length-1]
    return this.getValue(prefix)[property] = {has, value} || undefined
  }
}

class API {

  // actionPrefix({before, operator, words, after, semantic, create})
  //
  // before == [ { tag, marker }, ... ]
  // create == [ id, ... ] // ids to create bridges for
  createActionPrefix({ operator, before=[], after=[], create=[], config, relation, ordering }, semanticApply) {
    // const before = [...]
    // const after = [{tag: 'weapon', id: 'weapon'}]
    // const create = ['arm', 'weapon']

    const beforeOperators = before.map( (arg) => `([${arg.id}|])` ).join('')
    const afterOperators = after.map( (arg) => `([${arg.id}|])` ).join('')
    config.addOperator(`(${beforeOperators} [${operator}|] ${afterOperators})`)
   
    create.map( (id) => {
      if (id === operator) {
        const tagsToProps = (where, args) => {
          let i = 0;
          let r = ''
          for (let arg of args) {
            r += `, ${arg.tag}: ${where}[${i}] `
          }
          return r
        }
        const beforeArgs = tagsToProps('before', before)
        const afterArgs = tagsToProps('after', after)
        config.addBridge({ id: operator, level: 0, bridge: `{ ... next(operator) ${beforeArgs} ${afterArgs} }` })
        config.addWord(operator, { id: operator, initial: `{ value: "${operator}" }` })
      } else {
        config.addBridge({ id: id, level: 0, bridge: "{ ...next(operator) }"})
      }
    })

    const operatorSingular = pluralize.singular(operator)
    const operatorPlural = pluralize.plural(operator)
    config.addWord(operatorSingular, { id: operator, initial: `{ value: '${operator}' }`})
    config.addWord(operatorPlural, { id: operator, initial: `{ value: '${operator}' }`})

    config.addHierarchy(operator, 'canBeDoQuestion')

    config.addPriorities([['means', 0], [operator, 0]])
    config.addPriorities([[operator, 0], ['the', 0]])
    config.addPriorities([[operator, 0], ['a', 0]])

    config.addGenerator({
      match: ({context}) => context.marker == operator && context.paraphrase,
      apply: ({context, g}) => {
        const beforeGenerator = before.map( (arg) => g(context[arg.tag]) )
        const afterGenerator = after.map( (arg) => g(context[arg.tag]) )
        return beforeGenerator.concat([`${context.word}`]).concat(afterGenerator).join(' ')
      }
    })
 
    if (ordering) {
      config.addSemantic({
        match: ({context}) => context.marker == operator,
        apply: ({context, km}) => {
          const api = km('ordering').api
          api.setCategory(ordering.name, context[ordering.object].value, context[ordering.category].value, context.value)
        }
      })
      /*
      config.addSemantic({
        match: ({context}) => context.marker == operator && context.query,
        apply: ({context, km}) => {
          const api = km('properties').api
          context.response = api.relation_get(context, before.concat(after).map( (arg) => arg.tag ) )
        }
      })
      */
    }

    if (relation) {
      config.addSemantic({
        match: ({context}) => context.marker == operator,
        apply: ({context, km}) => {
          const api = km('properties').api
          api.relation_set(context)
        }
      })
      config.addSemantic({
        match: ({context}) => context.marker == operator && context.query,
        apply: ({context, km}) => {
          const api = km('properties').api
          context.response = api.relation_get(context, before.concat(after).map( (arg) => arg.tag ) )
        }
      })
    }

    if (semanticApply) {
      config.addSemantic({
        match: ({context}) => context.marker == operator,
        apply: semanticApply,
      })
    }
  }

  // for example, "crew member" or "photon torpedo"
  kindOfConcept({ config, modifier, object }) {
    const objectId = pluralize.singular(object)
    const modifierId = pluralize.singular(modifier)
    const modifierObjectId = `${modifierId}_${objectId}`

    const objectSingular = pluralize.singular(object)
    const objectPlural = pluralize.plural(object)
    config.addOperator(`(<${modifierId}|> ([${objectId}|]))`)
    config.addOperator(`([${modifierObjectId}|])`)

    config.addWord(objectSingular, { id: objectId, initial: `{ value: '${objectId}' }`})
    config.addWord(objectPlural, { id: objectId, initial: `{ value: '${objectId}' }`})
    config.addWord(modifierId, { id: modifierId, initial: `{ value: '${modifierId}' }`})

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
    if (!context.unknown) {
      return context.value
    }
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

    // mark g2reg as an instance?
    // add a generator for the other one what will ask what is the plural or singluar of known
    /*
    if (number == 'many') {
    } else if (number == 'one') {
    }
    */
    return concept;
  }

  relation_set(relation) {
    this.objects.relations.push(relation)
  }

  relation_match(args, template, value) {
    if (template.marker !== value.marker) {
      return null
    }

    const matches = (t, v) => {
      if (t.query) {
        return true
      }
      return t.value && v.value && t.value == v.value
    }

    for (let arg of args) {
      if (!matches(template[arg], value[arg])) {
        return null
      }
    }
    return value
  }

  // relation_get(context, before.concat(after).map( (arg) => arg.tag ) ) {
  relation_get(context, args) {
    const andTheAnswerIs = []
    for (let relation of this.objects.relations) {
      if (this.relation_match(args, context, relation)) {
        andTheAnswerIs.push(Object.assign({}, relation, { paraphrase: true }))
      }
    }
    return andTheAnswerIs
  }

  copyShared(fromApi) {
    for (let {path, handler} of fromApi.objects.initHandlers) {
      this.setShared(args, handler)
    }
  }

  setShared(path, handler) {
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
    this.setHandler(path, handler)
    this.objects.initHandlers.push( { path, handler } )
    return handler
  }

  setReadOnly(path) {
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
    this.setHandler(path, handler)
  }

  setHandler(path, handler) {
    let where = this.objects.handlers
    for (let arg of path.slice(0, path.length-1)) {
      if (!where[arg]) {
        where[arg] = {}
      }
      where = where[arg]
    }
    where[path[path.length-1]] = handler
    //handler.api = this
  }

  getObject(object) {
    return this.propertiesFH.getValue([object])
  }

  getHandler(object, property) {
    return this.propertiesFH.getHandler([object, property])
  }

  getProperty(object, property, g) {
    const handler = this.propertiesFH.getHandler([object, property])
    if (handler) {
      return handler.getProperty(object, property)
    }
    return this.getPropertyDirectly(object, property, g)
  }

  getPropertyDirectly(object, property, g) {
    if (property == 'properties') {
      const objectProps = this.propertiesFH.getValue([object])
      const values = []
      for (let key of Object.keys(objectProps)) {
        if (objectProps[key].has) {
          values.push(`${g(key)}: ${g({ ...objectProps[key].value, evaluate: true })}`)
        }
      }
      return { marker: 'list', value: values }
    } else {
      return this.propertiesFH.getValue([object, property]).value
    }
  }

  // DONE
  hasProperty(object, property, has) {
    return this.propertiesFH.getValue([object, property]).has
  }

  setProperty(object, property, value, has, skipHandler) {
    if (!skipHandler) {
      const handler = this.propertiesFH.getHandler([object, property])
      if (handler) {
        return handler.setProperty(object, property, value, has)
      }
    }

    this.setPropertyDirectly(object, property, value, has, skipHandler)
  }
 
  // DONE
  setPropertyDirectly(object, property, value, has, skipHandler) {
    this.propertiesFH.setValue([object, property], value, has)
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
    const path = [object]
    // return this.knownPropertyNew(path)
    return this.propertiesFH.knownProperty(path)
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
      if ((this.propertiesFH.getValue([next, property], false) || {}).has) {
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

  // NOT DONE
  knownProperty(object, property) {
    if (property == 'properties') {
      return true;
    }

    // go up the hierarchy
    const todo = [object];
    const seen = [object];
    while (todo.length > 0) {
      const next = todo.pop();
      if ((this.propertiesFH.getValue([next, property], false) || {}).has) {
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

    this.propertiesFH.ensureValue([child], {})
    this.propertiesFH.ensureValue([parent], {})
  }

  children(parent) {
    return this.objects.children[parent]
  }

  conceptExists(concept) {
    return this.objects.concepts.includes(concept)
  }

  set objects(objects) {
    this._objects = objects

    objects.concepts = []
    // object -> property -> {has, value}
    objects.properties = {}
    // property -> values
    objects.property = {}
    objects.handlers = {}
    objects.initHandlers = []
    objects.parents = {}
    objects.children = {}
    objects.relations = []
    this.propertiesFH = new Frankenhash(objects.properties, objects.handlers, objects.initHandlers)
  }

  get objects() {
    return this._objects
  }
}

module.exports = {
  API
}
