const { API } = require('./helpers_properties')

describe('helpersProperties', () => {
  describe('default', () => {
    describe('setProperty', () => {
      it('initialize objects', async () => {
        const api = new API()
        const objects = {}
        api.initialize(objects)
        expected = {
          "children":  {},
          "concepts": [],
          "handlers":  {},
          "initHandlers": [],
          "parents":  {},
          "properties":  {},
          "property":  {},
          "relations": [],
        }
        expect(objects).toStrictEqual(expected)
      })

      it('set property success non existant object no value', async () => {
        const api = new API()
        api.objects = {
          concepts: []
        }
        api.setProperty('object1', 'property1', 'value1')
        console.log(JSON.stringify(api.objects))
        expected = {
          "concepts": ["object1"],
          "properties": {
            "object1": {
              "property1": {
                "has": undefined,
                "value":"value1"
              }
            }
          }
        }
        expect(api.objects).toStrictEqual(expected)
      })

      it('set property success non existant object has value', async () => {
          const api = new API()
          api.objects = {
            concepts: [],
            property: {},
            parents: {},
            children: {},
          }
          api.setProperty('object1', 'property1', 'value1', 'has1')
          console.log(JSON.stringify(api.objects))
          expected = {
                "property1": {
                  "has": 'has1',
                  "value":"value1"
                }
              }
          expect(api.objects.properties.object1).toStrictEqual(expected)
        })
    })

    describe('getProperty', () => {
      it('get property success', async () => {
        const api = new API()
        api.objects = {
          concepts: []
        }
        api.setProperty('object1', 'property1', 'value1')
        const actual = api.getProperty('object1', 'property1')
        const expected = 'value1'
        expect(actual).toStrictEqual(expected)
      })
    })
  })

  describe('handler', () => {
    it('set object handler', async () => {
      const handler = new Object({
        setProperty: jest.fn(),
      })
      const api = new API()
      api.objects = {
        handlers: {}
      }
      api.setHandler(handler, 'object1')
      // expect(handler.api).toBe(api)
      expect(api.objects.handlers['object1']).toEqual(handler)
    })

    it('set uses object handler', async () => {
      const handler = new Object({
        setProperty: jest.fn(),
      })
      const api = new API()
      api.objects = {
        concepts: [],
        handlers: {},
      }
      api.setHandler(handler, 'object1')
      api.setProperty('object1', 'property1', 'value1', true)
      // expect(handler.api).toBe(api)
      expect(handler.setProperty).toBeCalledWith('object1', 'property1', 'value1', true)
    })

    it('set property handler', async () => {
      const handler = new Object({
        setProperty: jest.fn(),
      })
      const api = new API()
      api.objects = {
        handlers: {}
      }
      api.setHandler(handler, 'object1', 'property1')
      // expect(handler.api).toBe(api)
      expect(api.objects.handlers['object1']['property1']).toEqual(handler)
    })

    it('set uses property handler for object', async () => {
      const handler = new Object({
        setProperty: jest.fn(),
      })
      const api = new API()
      api.objects = {
        concepts: [],
        handlers: {},
      }
      api.setHandler(handler, 'object1')
      api.setProperty('object1', 'property1', 'value1', true)
      // expect(handler.api).toBe(api)
      expect(handler.setProperty).toBeCalledWith('object1', 'property1', 'value1', true)
    })

    it('set uses property handler for property', async () => {
      const handler = new Object({
        setProperty: jest.fn(),
      })
      const api = new API()
      api.objects = {
        concepts: [],
        handlers: {},
      }
      api.setHandler(handler, 'object1', 'property1')
      api.setProperty('object1', 'property1', 'value1', true)
      // expect(handler.api).toBe(api)
      expect(handler.setProperty).toBeCalledWith('object1', 'property1', 'value1', true)
    })

    it('get property success with object having a handler', async () => {
      const handler = new Object({
        getProperty: jest.fn().mockReturnValue(23),
      })
      const api = new API()
      api.objects = {
        concepts: [],
        handlers: {},
      }
      api.setHandler(handler, 'object1')
      const actual = api.getProperty('object1', 'property1')
      // expect(handler.api).toBe(api)
      expect(actual).toBe(23)
      expect(handler.getProperty).toBeCalledWith('object1', 'property1')
    })

    it('get property success with object property having a handler', async () => {
      const handler = new Object({
        getProperty: jest.fn().mockReturnValue(23),
      })
      const api = new API()
      api.objects = {
        concepts: [],
        handlers: {},
      }
      api.setHandler(handler, 'object1', 'property1')
      const actual = api.getProperty('object1', 'property1')
      // expect(handler.api).toBe(api)
      expect(actual).toBe(23)
      expect(handler.getProperty).toBeCalledWith('object1', 'property1')
    })
  })

  describe('readOnly', () => {
    it('mark object read only object', async () => {
      const api = new API()
      api.objects = {}
      api.initialize(api.objects)
      api.setProperty('object1', 'property1', 'value1', 'has1')
      api.setReadOnly('object1')
      expect(api.getProperty('object1', 'property1')).toEqual('value1')
      expect(() => api.setProperty('object1', 'property1', 'value1', 'has1')).toThrow("The property 'property1' of the object 'object1' is read only")
    })

    it('mark object read only property', async () => {
      const api = new API()
      api.objects = {}
      api.initialize(api.objects)
      api.setProperty('object1', 'property1', 'value1', 'has1')
      api.setReadOnly('object1', 'property1')
      expect(api.getProperty('object1', 'property1')).toEqual('value1')
      expect(() => api.setProperty('object1', 'property1', 'value1', 'has1')).toThrow("The property 'property1' of the object 'object1' is read only")
    })
  })

  describe('shared', () => {
    it('mark share object', async () => {
      const api1 = new API()
      api1.objects = {}
      api1.initialize(api1.objects)
      const share = api1.setShared(null, 'object1')

      const api2 = new API()
      api2.objects = {}
      api2.initialize(api2.objects)
      api2.setShared(share, 'object1')

      api1.setProperty('object1', 'property1', 'value1', 'has1')
      api2.setProperty('object1', 'property2', 'value2', 'has2')

      expect(api1.getProperty('object1', 'property1')).toEqual('value1')
      expect(api1.getProperty('object1', 'property2')).toEqual('value2')
      expect(api2.getProperty('object1', 'property1')).toEqual('value1')
      expect(api2.getProperty('object1', 'property2')).toEqual('value2')
      /*
        crew = ...
        crew.api('properties').setShared('object1')

        kirk, crew = 
        crew.api('properties').shared(kirk)

        spock, crew = 
        crew.api('properties').shared(spock)
      */
      /*
        crew = ...
        crew.api('properties').setShared('object1')

        // crew has list of all kms it was added to
        // init of shared 
        template = ['you are kirk']
        kirk = new Config({name: 'kirk'})
        kirk.add(crew)
        // XXX copy managed from crew to the kirk copy of crew
        // there is an api dup? make that do the copy
        crew.api('properties').shared(kirk)
        kirk.load( template )

        template = ['you are spock']
        spock = new Config({name: 'spock'})
        spock.add(crew)
        crew.api('properties').shared(spock)
        kirk.load( template )

        api.copiedTo(otherApi) => {
          otherApi.copyShared(api)
        }
      */
    })

    it('copy shared to copy', async () => {
      const api1 = new API()
      api1.objects = {}
      api1.initialize(api1.objects)
      api1.setShared(null, 'object1')

      const api2 = new API()
      api2.objects = {}
      api2.initialize(api2.objects)
      api2.copyShared(api1)

      api1.setProperty('object1', 'property1', 'value1', 'has1')
      api2.setProperty('object1', 'property2', 'value2', 'has2')

      expect(api1.getProperty('object1', 'property1')).toEqual('value1')
      expect(api1.getProperty('object1', 'property2')).toEqual('value2')
      expect(api2.getProperty('object1', 'property1')).toEqual('value1')
      expect(api2.getProperty('object1', 'property2')).toEqual('value2')
    })
  })

})
