const _ = require('lodash')
const { hashIndexesGet, hashIndexesSet, translationMapping, translationMappings } = require('./helpers_meta')

describe('helpersMeta', () => {
  describe('hashIndexGet', () => {
    it('success empty', () => {
      const hash = {}
      const actual = hashIndexesGet(hash, [])
      expect(actual).toStrictEqual(hash)
    })
    it('success one index', () => {
      const hash = { a: 'greg' }
      const actual = hashIndexesGet(hash, ['a'])
      expect(actual).toStrictEqual('greg')
    })
    it('success two indexes', () => {
      const hash = { a: { b: 'greg' } }
      const actual = hashIndexesGet(hash, ['a', 'b'])
      expect(actual).toStrictEqual('greg')
    })
  })

  describe('hashIndexSet', () => {
    it('success one index', () => {
      const hash = {}
      hashIndexesSet(hash, ['a'], 'greg')
      expect(hash).toStrictEqual({ a: 'greg' })
    })
    it('success two indexes', () => {
      const hash = {}
      hashIndexesSet(hash, ['a', 'b'], 'greg')
      expect(hash).toStrictEqual({ a: { b: 'greg' } })
    })
    it('success three indexes', () => {
      const hash = {}
      hashIndexesSet(hash, ['a', 'b', 'c'], 'greg')
      expect(hash).toStrictEqual({ a: { b: { c: 'greg' } } })
    })
  })

  describe('mappings', () => {
    it('empty mapping', () => {
      const from = {}
      const to = {}
      const actual = translationMapping(from, to)
      expect(actual).toStrictEqual([])
    })

    it('from top level to top level', () => {
      const from = { weapon: { marker: 'weapon', value: 'phaser' } }
      const to = { object: { marker: 'weapon', value: 'phaser' } }
      const actual = translationMapping(from, to)
      const expected = [{ from: ['weapon'], to: ['object'] }]
      expect(actual).toStrictEqual(expected)
    })

    it('from top level to next one level', () => {
      const from = { weapon: { marker: 'weapon', value: 'phaser' } }
      const to = { one: { object: { marker: 'weapon', value: 'phaser' } } }
      const actual = translationMapping(from, to)
      const expected = [{ from: ['weapon'], to: ['one', 'object'] }]
      expect(actual).toStrictEqual(expected)
    })
  })

  describe('mappingss', () => {
    it('empty mappings', () => {
      const to = {}
      const actual = translationMappings([], to)
      expect(actual).toStrictEqual([])
    })

    it('one', () => {
      const from = { weapon: { marker: 'weapon', value: 'phaser' } }
      const to = { object: { marker: 'weapon', value: 'phaser' } }
      const actual = translationMappings([from], to)
      const mapping1 = [{ from: ['weapon'], to: ['object'] }]
      const expected = [mapping1]
      expect(actual).toStrictEqual(expected)
    })

    it('two', () => {
      const from = { weapon: { marker: 'weapon', value: 'phaser' } }
      const to = { object: { marker: 'weapon', value: 'phaser' } }
      const actual = translationMappings([from, from], to)
      const mapping1 = [{ from: ['weapon'], to: ['object'] }]
      const expected = [mapping1, mapping1]
      expect(actual).toStrictEqual(expected)
    })

  })

  describe('semanticsGenerate', () => {
    const FROM = () => { return {
          "marker": "arm",
          "value": "arm",
          "weapon": {
            "concept": true,
            "determiner": "the",
            "marker": "weapon",
            "modifiers": [
              "determiner"
            ],
            "number": "one",
            "pullFromContext": true,
            "types": [
              "weapon"
            ],
            "value": "weapon",
            "wantsValue": true,
            "word": "weapon"
          },
          "word": "arm",
          "topLevel": true
        } }
    const TO = () => { return {
          "default": true,
          "marker": "is",
          "one": {
            "concept": true,
            "determiner": "the",
            "marker": "property",
            "modifiers": [
              "determiner"
            ],
            "object": {
              "concept": true,
              "determiner": "the",
              "marker": "weapon",
              "modifiers": [
                "determiner"
              ],
              "number": "one",
              "pullFromContext": true,
              "types": [
                "weapon"
              ],
              "value": "weapon",
              "wantsValue": true,
              "word": "weapon"
            },
            "pullFromContext": true,
            "types": [
              "property"
            ],
            "unknown": true,
            "value": "status",
            "wantsValue": true,
            "word": "status",
            "response": true
          },
          "two": {
            "marker": "unknown",
            "types": [
              "unknown"
            ],
            "unknown": true,
            "value": "armed",
            "word": "armed",
            "response": true
          },
          "word": "is",
          "topLevel": true
        }
      }

    it('success', () => {
      const from = FROM()
      const to = TO()

      const match = ({context}) => context.marker == "arm"
      // from+to generate mappings
      const mappings = [
        { from: ['weapon'], to: ['one', 'object'] },
      ]
      // context(from) + to-copy
      // const apply = (mappings, _.cloneDeep(to)) => ({context}) => {
      const apply = (mappings, TO) => ({context}) => {
        TO = _.cloneDeep(TO)
        for (let { from, to } of mappings) {
          hashIndexesSet(TO, to, hashIndexesGet(context, from))
        }
        Object.assign(context, TO)
      }
      const semantic = { match, apply }

      expect(match({ context: { marker: 'arm' } })).toBe(true)
      const context = {
        weapon: {
          marker: 'fromSourceContext'
        }
      }
      apply(mappings, _.cloneDeep(to))({context})
      const expected = TO()
      expected.weapon = context.weapon
      expected.one.object = context.weapon
      console.log(JSON.stringify(context, null, 2))
      expect(context).toStrictEqual(expected)
    })
  })
})
