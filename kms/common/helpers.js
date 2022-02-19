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

module.exports = {
  millisecondsUntilHourOfDay,
  indent,
  isMany,
}
