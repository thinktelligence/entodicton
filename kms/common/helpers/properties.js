const pluralize = require('pluralize')
const { unflatten, flattens } = require('entodicton')

class Frankenhash {
  constructor(data) {
    this.data = data
    this.data.root = {}
    this.data.handlers = {}
    this.data.initHandlers = []
  }

  setInitHandler({path, handler}) {
    this.data.initHandlers.push( { path, handler } )
  }

  setHandler(path, handler) {
    let where = this.data.handlers
    for (let arg of path.slice(0, path.length-1)) {
      if (!where[arg]) {
        where[arg] = {}
      }
      where = where[arg]
    }
    where[path[path.length-1]] = handler
  }

  getValue(path, writeDefault=true) {
    let value = this.data.root
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
    return value && !!value.getValue && !!value.setValue
  }

  getHandler(path) {
    let value = this.data.handlers
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
    let value = this.data.root;
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
    const prefix = path.slice(0, path.length - 1)
    const last = path[path.length-1]
    this.getValue(prefix)[last] = {has, value} || undefined
  }
}

class API {

  // actionPrefix({before, operator, words, after, semantic, create})
  //
  // before == [ { tag, marker }, ... ]
  // create == [ id, ... ] // ids to create bridges for
  // doAble : true if the qustion like this work "does b[0] <marker> b[0]" for example does g2reg like bananas
  createActionPrefix({ operator, before=[], after=[], create=[], config, relation, ordering, doAble }, semanticApply) {
    // const before = [...]
    // const after = [{tag: 'weapon', id: 'weapon'}]
    // const create = ['arm', 'weapon']

   if (doAble) {
      if (before.length != 1) {
        throw "Expected exactly one before argument"
      }
      if (after.length != 1) {
        throw "Expected exactly one after argument"
      }
    }

    const beforeOperators = before.map( (arg) => `([${arg.id}|])` ).join('')
    const afterOperators = after.map( (arg) => `([${arg.id}|])` ).join('')
    // config.addOperator(`(${beforeOperators} [${operator}|] ${afterOperators})`)
    if (doAble) {
      config.addOperator(`([(${beforeOperators} [${operator}|] ${afterOperators}?)])`)
      // config.addOperator({ id: operator, level: 1, words: [operator] })
      config.addBridge({ id: operator, level: 1, bridge: '{ ...next(operator) }' })
      config.addPriorities([[operator, 1], ['does', 0]])
      config.addPriorities([[operator, 1], ['doesnt', 0]])
      config.addPriorities([['does', 0], [operator, 0]])
      config.addPriorities([['doesnt', 0], [operator, 0]])
    } else {
      config.addOperator(`(${beforeOperators} [${operator}|] ${afterOperators})`)
    }
   
    create.map( (id) => {
      if (id === operator) {
        const tagsToProps = (where, args, suffix='') => {
          let i = 0;
          let r = ''
          for (let arg of args) {
            r += `, ${arg.tag}${suffix}: ${where}[${i}] `
          }
          return r
        }
        const beforeArgs = tagsToProps('before', before)
        let afterArgs = tagsToProps('after', after)
        let doParams = '';
        if (doAble) {
          doParams = `, do: { left: "${before[0].tag}", right: "${after[0].tag}" } `
          afterArgs = tagsToProps('after', after, '*')
        }
        config.addBridge({ id: operator, level: 0, bridge: `{ ... next(operator) ${doParams} ${beforeArgs} ${afterArgs} }` })
        config.addWord(operator, { id: operator, initial: `{ value: "${operator}" }` })
      } else {
        config.addBridge({ id: id, level: 0, bridge: "{ ...next(operator) }"})
      }
    })

    const operatorSingular = pluralize.singular(operator)
    const operatorPlural = pluralize.plural(operator)
    config.addWord(operatorSingular, { id: operator, initial: `{ value: '${operator}' }`})
    config.addWord(operatorPlural, { id: operator, initial: `{ value: '${operator}' }`})

    if (doAble) {
      config.addHierarchy(operator, 'canBeDoQuestion')
    }

    config.addPriorities([['means', 0], [operator, 0]])
    config.addPriorities([[operator, 0], ['the', 0]])
    config.addPriorities([[operator, 0], ['a', 0]])

    config.addGenerator({
      notes: 'ordering generator for paraphrase',
      match: ({context}) => context.marker == operator && context.paraphrase && !context.query,
      apply: ({context, g}) => {
        const beforeGenerator = before.map( (arg) => g(context[arg.tag]) )
        const afterGenerator = after.map( (arg) => g(context[arg.tag]) )
        return beforeGenerator.concat([`${context.word}`]).concat(afterGenerator).join(' ')
      }
    })

    config.addGenerator({
      notes: 'ordering generator for response',
      match: ({context}) => context.marker == operator && context.response,
      apply: ({context, g}) => {
        const { response } = context 
        let yesno = ''
        if (!context.do.query) {
          if (context.truthValue) {
            yesno = 'yes'
          } else if (context.truthValue === false) {
            yesno = 'no'
          }
        }
        return `${yesno} ${g(Object.assign({}, response, { paraphrase: true }))}`
      }
    })
 
    if (ordering) {
      config.addSemantic({
        notes: 'ordering setter',
        // TODO use hierarchy for operator
        match: ({context}) => context.marker == operator,
        apply: ({context, km}) => {
          //const api = km('ordering').api
          // api.setCategory(ordering.name, context[ordering.object].value, context[ordering.category].value, context)
          const propertiesAPI = km('properties').api
          context.ordering = ordering.name
          const fcontext = flattens(['list'], [context])
          propertiesAPI.relation_add(fcontext) 
          // propertiesAPI.relation_add(context) 
        }
      })
      config.addSemantic({
        notes: 'ordering query',
        match: ({context}) => context.marker == operator && context.query,
        apply: ({context, km}) => {
          const api = km('ordering').api

          /*
          const value = api.getCategory(ordering.name, context[ordering.object].value, context[ordering.category].value)
          context.truthValue = (value.marker == context.marker)
          context.response = value
          */

          const propertiesAPI = km('properties').api
          context.ordering = ordering.name
          const matches = propertiesAPI.relation_get(context, ['ordering', ordering.object, ordering.category])
          if (matches.length > 0) {
            context.truthValue = matches.length > 0
            context.response = { marker: 'list', value: unflatten.unflatten(matches) }
          } else {
            // see if anything is preferred greg
            const matches = propertiesAPI.relation_get(context, ['ordering'])
            context.truthValue = matches.length > 0 && matches[0].marker == ordering.marker
            context.response = { marker: 'list', value: matches }
          }
        }
      })
    }

    if (relation) {
      config.addSemantic({
        notes: `setter for ${operator}`,
        match: ({context}) => context.marker == operator,
        apply: ({context, km}) => {
          const api = km('properties').api
          api.relation_add(context)
        }
      })
      config.addSemantic({
        notes: `getter for ${operator}`,
        match: ({context}) => context.marker == operator && context.query,
        apply: ({context, km}) => {
          const api = km('properties').api
          context.response = api.relation_get(context, before.concat(after).map( (arg) => arg.tag ) )
        }
      })
    }

    if (semanticApply) {
      config.addSemantic({
        notes: `override semantic apply for ${operator}`,
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
    if (config.config.bridges.find( (bridge) => bridge.id === 'hierarchyAble' )) {
      config.addHierarchy(objectId, 'hierarchyAble')
      config.addHierarchy(modifierObjectId, 'hierarchyAble')
    }

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
      /*
      config.addGenerator({
          notes: 'generator for added concept',
          match: ({context}) => context.value == concept && context.number == number && context.paraphrase,
          apply: () => word
      })
      */
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

  relation_add(relations) {
    if (!Array.isArray(relations)) {
      relations = [relations]
    }
    for (let relation of relations) {
      this.objects.relations.push(relation)
    }
  }

  relation_match(args, template, value) {
    // greg
    const matches = (t, v) => {
      if (typeof t == 'string' || typeof v == 'string') {
        return t == v
      }

      if (!t || !v) {
        return null
      }

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

  /*
  copyShared(fromApi) {
    for (let {path, handler} of fromApi.objects.initHandlers) {
      this.setShared(args, handler)
    }
  }
  */

  setShared(path, handler) {
    if (!handler) {
      handler = new Object({
        setValue: ([object, property], value, has) => {
          return this.setProperty(object, property, value, has, true)
        },
        getValue: ([object, property]) => {
          return this.getPropertyDirectly(object, property)
        },
      })
    }
    this.propertiesFH.setHandler(path, handler)
    this.propertiesFH.setInitHandler( { path, handler } )
    return handler
  }

  setReadOnly(path) {
    const handler = new Object({
      setValue: ([object, property], value, has) => {
        const error = Error(`The property '${property}' of the object '${object}' is read only`)
        error.code = 'ReadOnly'
        throw error
      },
      getValue: ([object, property]) => {
        return this.getPropertyDirectly(object, property)
      },
    })
    this.propertiesFH.setHandler(path, handler)
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
      return handler.getValue([object, property])
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

  hasProperty(object, property, has) {
    return this.propertiesFH.getValue([object, property]).has
  }

  setProperty(object, property, value, has, skipHandler) {
    if (!skipHandler) {
      const handler = this.propertiesFH.getHandler([object, property])
      if (handler) {
        return handler.setValue([object, property], value, has)
      }
    }

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
    objects.parents = {}
    objects.children = {}
    objects.relations = []
    this.propertiesFH = new Frankenhash(objects.properties)
  }

  get objects() {
    return this._objects
  }
}

module.exports = {
  API,
  Frankenhash,
}
