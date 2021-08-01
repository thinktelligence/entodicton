const helpers = require('./helpers')

describe('helpers', () => {
  describe('millisecondsUntilHourOfDay', () => {
    it('time is same day', async () => {
      const mockDate1 = new Date("Sun Aug 01 2021 01:00:00 GMT-0700 (Pacific Daylight Time)")
      const mockDate2 = new Date("Sun Aug 01 2021 01:00:00 GMT-0700 (Pacific Daylight Time)")
      const spy = jest
        .spyOn(global, 'Date')
        .mockImplementationOnce(() => mockDate1)
        .mockImplementationOnce(() => mockDate2)
      const ms = helpers.millisecondsUntilHourOfDay(2)
      expect(ms).toBe(1 * 60 * 60 * 1000)
      spy.mockRestore()
    })

    it('time is next day', async () => {
      const mockDate1 = new Date("Sun Aug 01 2021 02:00:00 GMT-0700 (Pacific Daylight Time)")
      const mockDate2 = new Date("Sun Aug 01 2021 02:00:00 GMT-0700 (Pacific Daylight Time)")
      const spy = jest
        .spyOn(global, 'Date')
        .mockImplementationOnce(() => mockDate1)
        .mockImplementationOnce(() => mockDate2)
      const ms = helpers.millisecondsUntilHourOfDay(1)
      expect(ms).toBe(23 * 60 * 60 * 1000)
      spy.mockRestore()
    })

    it('time is same hour make ms zero', async () => {
      const mockDate1 = new Date("Sun Aug 01 2021 01:55:00 GMT-0700 (Pacific Daylight Time)")
      const mockDate2 = new Date("Sun Aug 01 2021 01:55:00 GMT-0700 (Pacific Daylight Time)")
      const spy = jest
        .spyOn(global, 'Date')
        .mockImplementationOnce(() => mockDate1)
        .mockImplementationOnce(() => mockDate2)
      const ms = helpers.millisecondsUntilHourOfDay(1)
      expect(ms).toBe(0)
      spy.mockRestore()
    })
  })
})
