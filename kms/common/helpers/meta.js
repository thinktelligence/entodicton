const _ = require('lodash')

const hashIndexesGet = (hash, indexes) => {
  let value = hash
  for (let i of indexes) {
    value = value[i]
  }
  return value
}

const hashIndexesSet = (hash, indexes, value) => {
  let currentValue = hash
  for (let i of indexes.slice(0, -1)) {
    if (!currentValue[i]) {
      currentValue[i] = {}
    }
    currentValue = currentValue[i]
  }
  currentValue[indexes[indexes.length-1]] = value
}

const isPrefix = (prefix, fix) => {
  return prefix.every((element, index) => {
    return prefix[index] === fix[index]
  })
  return true
}

// assumes isPrefix is true
const replacePrefix = (prefix, prefixPrime, fix) => {
  return prefixPrime.concat(fix.slice(prefix.length))
}

const compose = (m1s, m2s) => {
  return m2s.map( (m2) => { 
    m1 = m1s.find( (m1) => isPrefix(m1.from, m2.from) )
    if (m1) {
      return { ...m2, from: replacePrefix(m1.from, m1.to, m2.from) }
    } else {
      return m2
    }
  });
}
/*
      const m1 = '[{"from":["one"],"to":["two"]},{"from":["two"],"to":["one"]}]'
      m1 + m2 -> '[{"from":["one"],"to":["owner"]},{"from":["two"],"to":["ownee"]},{"from":["number"],"to":["number"]}]'
      output
          '[{"from":["two"],"to":["owner"]},{"from":["one"],"to":["ownee"]},{"from":["number"],"to":["number"]}]'
*/

const translationMapping = (from, to) => {
  const mappings = []
  if (from.atomic) {
    return mappings
  }
  for (let fkey of Object.keys(from)) {
    let matchField;
    if (from[fkey].value) {
      matchField = 'value'
    } else if (from[fkey].word) {
      matchField = 'word'
    }

    // if (from[fkey][matchField]) {
    if (matchField) {
      let found = false
      const todo = Object.keys(to).map( (key) => [key] )
      while (!found) {
        const tkey = todo.shift()
        const tvalue = hashIndexesGet(to, tkey);
        const fvalue = hashIndexesGet(from, [fkey]);
        if (fvalue[matchField] == tvalue[matchField]) {
          mappings.push( { from: [fkey], to: tkey } )
          found = true
          break
        } else {
          if (typeof tvalue !== 'string' && typeof tvalue !== 'number') {
            for (let key of Object.keys(tvalue)) {
              todo.push(tkey.concat(key))
            }
          }
        }
      }
    }
  }
  if (to.number) {
    mappings.push({"from":["number"],"to":["number"]})
  }
  return mappings
}

const translationMappings = (froms, to) => {
  const mappingss = []
  for (const from of froms) {
    mappingss.push(translationMapping(from, to))
  }
  return mappingss
}

const translationMappingToInstantiatorMappings  = (translationMapping, from , to) => {
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

module.exports = {
  isPrefix,
  replacePrefix,
  compose,
  hashIndexesGet,
  hashIndexesSet,
  translationMapping,
  translationMappings,
  translationMappingToInstantiatorMappings,
}
