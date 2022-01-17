const { API, Frankenhash } = require('./helpers_properties')

describe('helpersProperties', () => {
  describe('default', () => {
    describe('setProperty', () => {
      it('initialize objects', async () => {
        const api = new API()
        const objects = {}
        api.objects = objects
        expected = {
          "children":  {},
          "concepts": [],
          "properties":  {
            "root":  {},
            "handlers":  {},
            "initHandlers": [],
          },
          "parents":  {},
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
        console.log(JSON.stringify(api.objects, null, 2))
        expected = {
          "concepts": [
            "object1"
          ],
          "properties": {
            "root": {
              "object1": {
                "property1": {
                  "value": "value1",
                  "has": undefined,
                }
              }
            },
            "handlers": {},
            "initHandlers": []
          },
          "property": {},
          "parents": {},
          "children": {},
          "relations": []
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
          expect(api.objects.properties.root.object1).toStrictEqual(expected)
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
        getValue: jest.fn(),
        setValue: jest.fn(),
      })
      const api = new API()
      api.objects = {
        handlers: {}
      }
      api.propertiesFH.setHandler(['object1'], handler)
      // expect(handler.api).toBe(api)
      expect(api.objects.properties.handlers['object1']).toEqual(handler)
    })

    it('set uses object handler', async () => {
      const handler = new Object({
        getValue: jest.fn(),
        setValue: jest.fn(),
      })
      const api = new API()
      api.objects = {
        concepts: [],
        handlers: {},
      }
      api.propertiesFH.setHandler(['object1'], handler)
      api.setProperty('object1', 'property1', 'value1', true)
      // expect(handler.api).toBe(api)
      expect(handler.setValue).toBeCalledWith(['object1', 'property1'], 'value1', true)
    })

    it('set property handler', async () => {
      const handler = new Object({
        getValue: jest.fn(),
        setValue: jest.fn(),
      })
      const api = new API()
      api.objects = {
        handlers: {}
      }
      api.propertiesFH.setHandler(['object1', 'property1'], handler)
      // expect(handler.api).toBe(api)
      expect(api.objects.properties.handlers['object1']['property1']).toEqual(handler)
    })

    it('set uses property handler for object', async () => {
      const handler = new Object({
        getValue: jest.fn(),
        setValue: jest.fn(),
      })
      const api = new API()
      api.objects = {
        concepts: [],
        handlers: {},
      }
      api.propertiesFH.setHandler(['object1'], handler)
      api.setProperty('object1', 'property1', 'value1', true)
      // expect(handler.api).toBe(api)
      expect(handler.setValue).toBeCalledWith(['object1', 'property1'], 'value1', true)
    })

    it('set uses property handler for property', async () => {
      const handler = new Object({
        getValue: jest.fn(),
        setValue: jest.fn(),
      })
      const api = new API()
      api.objects = {
        concepts: [],
        handlers: {},
      }
      api.propertiesFH.setHandler(['object1', 'property1'], handler)
      api.setProperty('object1', 'property1', 'value1', true)
      // expect(handler.api).toBe(api)
      expect(handler.setValue).toBeCalledWith(['object1', 'property1'], 'value1', true)
    })

    it('get property success with object having a handler', async () => {
      const handler = new Object({
        getValue: jest.fn().mockReturnValue(23),
        setValue: jest.fn(),
      })
      const api = new API()
      api.objects = {
        concepts: [],
        handlers: {},
      }
      api.propertiesFH.setHandler(['object1'], handler)
      const actual = api.getProperty('object1', 'property1')
      expect(actual).toBe(23)
      expect(handler.getValue).toBeCalledWith(['object1', 'property1'])
    })

    it('get property success with object property having a handler', async () => {
      const handler = new Object({
        getValue: jest.fn().mockReturnValue(23),
        setValue: jest.fn(),
      })
      const api = new API()
      api.objects = {}
      api.propertiesFH.setHandler(['object1', 'property1'], handler)
      const actual = api.getProperty('object1', 'property1')
      // expect(handler.api).toBe(api)
      expect(actual).toBe(23)
      expect(handler.getValue).toBeCalledWith(['object1', 'property1'])
    })
  })

  describe('readOnly', () => {
    it('mark object read only object', async () => {
      const api = new API()
      api.objects = {}
      api.setProperty('object1', 'property1', 'value1', 'has1')
      api.setReadOnly(['object1'])
      expect(api.getProperty('object1', 'property1')).toEqual('value1')
      expect(() => api.setProperty('object1', 'property1', 'value1', 'has1')).toThrow("The property 'property1' of the object 'object1' is read only")
    })

    it('mark object read only property', async () => {
      const api = new API()
      api.objects = {}
      api.setProperty('object1', 'property1', 'value1', 'has1')
      api.setReadOnly(['object1', 'property1'])
      expect(api.getProperty('object1', 'property1')).toEqual('value1')
      expect(() => api.setProperty('object1', 'property1', 'value1', 'has1')).toThrow("The property 'property1' of the object 'object1' is read only")
    })
  })

  describe('shared', () => {
    it('mark share object', async () => {
      const api1 = new API()
      api1.objects = {}
      const share = api1.setShared(['object1'])

      const api2 = new API()
      api2.objects = {}
      api2.setShared(['object1'], share)

      debugger;
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

    /*
    it('copy shared to copy', async () => {
      const api1 = new API()
      api1.objects = {}
      debugger;
      //api1.initialize(api1.objects)
      api1.setShared(['object1'])

      const api2 = new API()
      api2.objects = {}
      api2.copyShared(api1)

      api1.setProperty('object1', 'property1', 'value1', 'has1')
      api2.setProperty('object1', 'property2', 'value2', 'has2')

      expect(api1.getProperty('object1', 'property1')).toEqual('value1')
      expect(api1.getProperty('object1', 'property2')).toEqual('value2')
      expect(api2.getProperty('object1', 'property1')).toEqual('value1')
      expect(api2.getProperty('object1', 'property2')).toEqual('value2')
    })
    */
  })

})
