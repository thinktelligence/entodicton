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

    it('zip empty list', async () => {
      expect(helpers.zip([])).toStrictEqual([])
    })

    it('zip one list', async () => {
      expect(helpers.zip([1,2,3])).toStrictEqual([[1], [2], [3]])
    })

    it('zip two list', async () => {
      expect(helpers.zip([1,2,3], [4,5,6])).toStrictEqual([[1,4], [2,5], [3,6]])
    })

    it('zip three list', async () => {
      expect(helpers.zip([1,2,3], [4,5,6], [7,8,9])).toStrictEqual([[1,4,7], [2,5,8], [3,6,9]])
    })
  })
})

describe('focus', () => {
  it('empty', () => {
    context = {}
    expect(helpers.focus(context)).toStrictEqual({})
  })

  it('topLevel focusable not focus', () => {
    context = {
      focusable: ['a'],
      a: {
        value: 'this is a'
      }
    }
    expect(helpers.focus(context)).toStrictEqual(context)
  })

  it('topLevel focusable has focus', () => {
    context = {
      focusable: ['a'],
      a: {
        value: 'this is a',
        focus: true,
      }
    }
    expect(helpers.focus(context)).toStrictEqual(context.a)
  })

  it('topLevel focusable has focus nested two deep outer is set to focus', () => {
    context = {
      focusable: ['a'],
      a: {
        focusable: ['b'],
        b: { value: 'this is b', focus: true },
        value: 'this is a',
        focus: true,
      }
    }
    expect(helpers.focus(context)).toStrictEqual(context.a.b)
  })

  it('topLevel focusable has focus nested two deep outer is not set to focus', () => {
    context = {
      focusable: ['a'],
      a: {
        focusable: ['b'],
        b: { value: 'this is b', focus: true },
        value: 'this is a',
      }
    }
    expect(helpers.focus(context)).toStrictEqual(context.a.b)
  })
})

