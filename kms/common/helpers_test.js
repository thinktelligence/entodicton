const helpers = require('./helpers')

newDateMock = (date) => {
  const dates = [
    new Date(date),
    new Date(date)
  ]
  return () => {
    return dates.pop()
  }
}

describe('helpers', () => {
  describe('millisecondsUntilHourOfDay', () => {
    it('time is same day', async () => {
      const newDate = newDateMock( new Date("Sun Aug 01 2021 01:00:00 GMT-0700 (Pacific Daylight Time)") )
      const ms = helpers.millisecondsUntilHourOfDay(newDate, 2)
      expect(ms).toBe(1 * 60 * 60 * 1000)
    })

    it('time is next day', async () => {
      const newDate = newDateMock( new Date("Sun Aug 01 2021 02:00:00 GMT-0700 (Pacific Daylight Time)") )
      const ms = helpers.millisecondsUntilHourOfDay(newDate, 1)
      expect(ms).toBe(23 * 60 * 60 * 1000)
    })

    it('time is same hour make ms zero', async () => {
      const newDate = newDateMock( new Date("Sun Aug 01 2021 01:55:00 GMT-0700 (Pacific Daylight Time)") )
      const ms = helpers.millisecondsUntilHourOfDay(newDate, 1)
      expect(ms).toBe(0)
    })
  })
})
