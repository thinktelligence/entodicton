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
  if (((context || {}).value || {}).marker == 'list' && (((context || {}).value || {}).value || []).length > 1) {
    return true
  }
  if (context.number == 'many') {
    return true
  }
  if (context.number == 'one') {
    return false
  }
  if (context.word && pluralize.isPlural(context.word)) {
    return true
  }
  return false
}

const chooseNumber = (context, one, many) => {
  if (isMany(context)) {
    return many;
  } else {
    return one;
  }
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

// if property is a list make array of elements of the list, if not return an array with the property value
const propertyToArray = (value) => {
  if (value.marker == 'list') {
    return value.value
  } else {
    return [value]
  }
}

module.exports = {
  millisecondsUntilHourOfDay,
  indent,
  isMany,
  chooseNumber,
  zip,
  focus,
  propertyToArray,
}
