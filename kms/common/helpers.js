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
    //const tuple = arrays.map( (array) => array[i] )
    let tuple = []
    for (const array of arrays) {
      tuple.push(array[i])
    }
    zipped.push(tuple)
  }
  return zipped
}

const focus = (context) => {
  return []
  if (!context.focusable) {
    return []
  }
  debugger;
  console.log(JSON.stringify(context, null, 2))
  for (const property of context.focusable) {
    if (context[property].focus) {
      return context[property]
    }
  }
  return []
}

module.exports = {
  millisecondsUntilHourOfDay,
  indent,
  isMany,
  zip,
  focus,
}
