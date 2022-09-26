const { API } = require('./ordering')
const { API:APIProperties } = require('./properties')

describe('helpersOrdering', () => {

  it('create', async () => {
    api = new API()
    api.objects = {}
    api.createOrdering({ name: 'speed'})
    // expect(objects).toStrictEqual(expected)
  })

  describe('categories', () => {
    // TODO fix this
    xit('ONEknown comparison', async () => {
      api = new API()
      apiProperties = new APIProperties()
      km = jest.fn()
      km.mockReturnValue({ api: apiProperties })
      config = { km }
      const objects = {}
      api.initialize({ config, objects })
      api.createOrdering({ name: 'speed', categories: [['slowest', 'slow'], ['fastest', 'fast']] })

      api.setCategory('speed', 'greg', 'a', 'slowest')
      expect(api.getCategory('speed', 'greg', 'a')).toStrictEqual( 'slowest' )
      expect(api.inCategory('speed', 'greg', 'a', 'slow')).toStrictEqual( true )
    })

    // TODO fix this
    xit('lessThan with categories', async () => {
      const objects = {}
      api = new API()
      api.objects = objects
      api.initialize(objects)
      api.createOrdering({ name: 'speed', categories: [['slowest', 'slow'], ['fastest', 'fast']], ordering: [['slowest', 'slow'], ['slow', 'fast'], ['fast', 'fastest']] })
      api.setCategory('speed', 'greg', 'a', 'slowest')
      api.setCategory('speed', 'greg', 'b', 'fast')
      expect(api.getLessThan({ name: 'speed', context: 'greg', smaller: 'a', larger: 'b' })).toStrictEqual( true )
      expect(api.getLessThan({ name: 'speed', context: 'greg', smaller: 'b', larger: 'a' })).toStrictEqual( false )
    })
  })

  describe('lessThan', () => {
    it('known comparison - a is slower than b', async () => {
      api = new API()
      apiProperties = new APIProperties()
      km = jest.fn()
      km.mockReturnValue({ api: apiProperties })
      config = { km }
      const objects = {}
      api.initialize({ km, config, objects })
      api.createOrdering({ name: 'speed', sections: ['slowest', 'slow', 'fast', 'fastest'] })
      const less1 = { name: 'speed', context: 'greg', smaller: 'a', larger: 'b' }
      api.setLessThan(less1)
      const results = api.getLessThan({ name: 'speed', context: 'greg', smaller: 'a', larger: 'b' })
      expect(results).toStrictEqual( [less1] )
    })

    it('known comparison - what is slower than c', async () => {
      api = new API()
      apiProperties = new APIProperties()
      km = jest.fn()
      km.mockReturnValue({ api: apiProperties })
      config = { km }
      const objects = {}
      api.initialize({ km, config, objects })

      api.createOrdering({ name: 'speed' })
      const less1 = { name: 'speed', context: 'greg', smaller: 'a', larger: 'b' }
      const less2 = { name: 'speed', context: 'greg', smaller: 'b', larger: 'c' }
      api.setLessThan(less1)
      api.setLessThan(less2)
      const results = api.getLessThan({ name: 'speed', context: 'greg', larger: 'c' })
      console.log('results', JSON.stringify(results, null, 2))
      const expected_less1 = { name: 'speed', context: 'greg', smaller: 'b', larger: 'c' }
      const expected_less2 = { name: 'speed', context: 'greg', smaller: 'a', larger: 'c' }
      expect(results).toStrictEqual( [expected_less1, expected_less2] )
    })

    it('known comparison - what is slower than a', async () => {
      api = new API()
      apiProperties = new APIProperties()
      km = jest.fn()
      km.mockReturnValue({ api: apiProperties })
      config = { km }
      const objects = {}
      api.initialize({ km, config, objects })

      api.createOrdering({ name: 'speed' })
      const less1 = { name: 'speed', context: 'greg', smaller: 'a', larger: 'b' }
      const less2 = { name: 'speed', context: 'greg', smaller: 'b', larger: 'c' }
      api.setLessThan(less1)
      api.setLessThan(less2)
      const results = api.getLessThan({ name: 'speed', context: 'greg', smaller: 'a' })
      console.log('results', JSON.stringify(results, null, 2))
      const expected_less1 = { name: 'speed', context: 'greg', smaller: 'a', larger: 'b' }
      const expected_less2 = { name: 'speed', context: 'greg', smaller: 'a', larger: 'c' }
      expect(results).toStrictEqual( [expected_less1, expected_less2] )
    })
  })

})
