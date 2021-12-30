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

const translationMapping = (from, to) => {
  const mappings = []
  for (let fkey of Object.keys(from)) {
    if (from[fkey].value) {
      let found = false
      const todo = Object.keys(to).map( (key) => [key] )
      while (!found) {
        const tkey = todo.shift()
        const tvalue = hashIndexesGet(to, tkey);
        const fvalue = hashIndexesGet(from, [fkey]);
        if (fvalue.value == tvalue.value) {
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
  return mappings
}

module.exports = {
  hashIndexesGet,
  hashIndexesSet,
  translationMapping,
}
