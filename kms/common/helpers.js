
// X pm today or tomorrow
const millisecondsUntilHourOfDay = (hour) => {
  debugger;
  const now = new Date()
  const target = new Date(now)

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

module.exports = {
  millisecondsUntilHourOfDay
}
