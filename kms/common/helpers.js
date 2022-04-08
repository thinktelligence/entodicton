const pluralize = require('pluralize')

// X pm today or tomorrow
const millisecondsUntilHourOfDay = (newDate, hour) => {
  const now = newDate()
  const target = newDate(now)

  const addHours = (date, h) => {
    date.setTime(date.getTime() + (h*60*60*1000));
  }
  const hours = target.getHours()
  if (hours == hour) {
    return 0
  }
  if (hours > hour) {
    addHours(target, 24)
  }
  target.setHours(hour, 0, 0, 0)
  var diff = Math.abs(target - now);
  return diff;
}

const indent = (string, indent) => {
  return string.replace(/^/gm, ' '.repeat(indent));
}

const isMany = (context) => {
  if (((context || {}).value || {}).marker == 'list') {
    return true
  }
  if (context.number == 'many') {
    return true
  }
  if (context.word && pluralize.isPlural(context.word)) {
    return true
  }
  return false
}

const zip = (...arrays) => {
  if (arrays == []) {
    return []
  }
  const zipped = []
  for(let i = 0; i < arrays[0].length; i++){
    let tuple = []
    for (const array of arrays) {
      tuple.push(array[i])
    }
    zipped.push(tuple)
  }
  return zipped
}


const focus = (context) => {
  const helper = (context) => {
    if (!context || !context.focusable) {
      return null
    }
    for (const property of context.focusable) {
      let focus = helper(context[property])
      if (!focus && (context[property] || {}).focus) {
        focus = context[property]
      }
      return focus
    }
    return null
  }
  return helper(context) || context
}

/*
  Use this for leaning matches to the generators or semantics
      how to deal with or's? maybe massive or'ing with simplification
      what about and's
  Generator the mappings as in meta as well?
*/
const common = (jsons) => {
  const propertiess = jsons.map( (json) => new Set(Object.keys()) )
  const properties = Array.from(propertiess[0]) 
  for (const ps of propertiess.slice(1)) {
    let next = []
    for (p of ps) {
      if (properties.has(p)) {
        next.push(p)
      }
    }
  }
}

module.exports = {
  millisecondsUntilHourOfDay,
  indent,
  isMany,
  zip,
  focus,
}
