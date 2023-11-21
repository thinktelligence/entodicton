const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const hierarchy = require('./hierarchy.js')
const pipboy_tests = require('./pipboy.test.json')

class API {
  // id in stats, inv, data, map, radio
  setDisplay(id) {
    this.objects.display = id
  }

  setWeapon(id) {
  }

  getWeapons() {
  }
}
const api = new API()

let config = {
  name: 'pipboy',
  operators: [
    "([show] ([showable|]))",
    "(([content]) [tab])",
  ],
  bridges: [
    { 
       id: "show", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), showable: after[0] }",
       generatorp: ({context, g}) => `show ${g(context.showable)}`,
       semantic: ({api, context}) => {
         debugger;
         api.setDisplay(context.showable.value)
       }
    },
    { 
       id: "tab", 
       level: 0, 
       isA: ['showable'],
       bridge: "{ ...next(operator), showable: before[0], modifiers: ['showable'] }" 
    },
    { 
       id: "showable", 
       level: 0, 
       isA: ['theAble'],
       bridge: "{ ...next(operator) }" ,
    },
    { 
       id: "content", 
       level: 0, 
       isA: ['showable'],
       bridge: "{ ...next(operator) }" ,
       words: [['stat', 'stat'], ['stats', 'stat'], ['statistics', 'stat'], ['inventory', 'inv'], ['data', 'data'], ['map', 'map'], ['radio', 'radio']].map(
            ([word, value]) => { return { word, value } })
    },
  ],

  generators: [
    { 
      where: where(),
      match: ({context}) => context.marker == 'currency' && !context.isAbstract, 
      apply: ({context, g}) => {
        word = Object.assign({}, context.amount)
        word.isAbstract = true
        word.marker = 'currency'
        word.units = context.units
        word.value = context.amount.value
        // generator = [({context}) => context.marker == 'currency' && context.units == words.units && context.value > 1 && context.isAbstract, ({context, g}) => words.many ]
        return `${g(context.amount.value)} ${g(word)}`
      } 
    },
  ],

  semantics: [
    {
      match: ({objects, context}) => context.marker == 'in',
      where: where(),
      apply: ({objects, api, context}) => {
        const from = context.from
        const to = context.to
        const value = api.convertTo(from.amount.value, from.units, to.units)
        context.marker = 'currency'
        context.isAbstract = false
        context.amount = { value }
        context.units = to.units
        context.isResponse = true
      }
    }
  ],
};

config = new Config(config, module)
config.add(hierarchy)
config.api = api
config.initializer( ({config, objects, api, uuid}) => {
  /*
  units = api.getUnits()
  for (word in units) {
    words = config.get('words')
    def = {"id": "currency", "initial": { units: units[word] }, uuid}
    if (words[word]) {
      words[word].push(def)
    } else {
      words[word] = [def]
    }
  }

  unitWords = api.getUnitWords();
  for (let words of unitWords) {
      config.addGenerator(
        ({context}) => context.marker == 'currency' && context.units == words.units && context.value == 1 && context.isAbstract, 
        ({context, g}) => words.one, uuid
      );
      config.addGenerator(
        ({context}) => context.marker == 'currency' && context.units == words.units && !isNaN(context.value) && (context.value != 1) && context.isAbstract, 
        ({context, g}) => words.many, uuid
      )
  }
  */
})

knowledgeModule({ 
  module,
  description: 'Control a pipboy with speech',
  config,
  test: {
    name: './pipboy.test.json',
    contents: pipboy_tests
  },
})
