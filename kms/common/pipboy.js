const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const hierarchy = require('./hierarchy.js')
const pipboy_tests = require('./pipboy.test.json')

class API {
  // id in stats, inv, data, map, radio
  //      under stats: status, special, perks
  //      under inventory: weapons, apparel, aid
  setDisplay(id) {
    this.objects.display = id
  }

  setWeapon(id) {
  }

  getWeapons() {
  }

  // { item: 'stimpack', quantity: <number>, to?: [ { part: ['arm', 'leg', 'torso', head'], side?: ['left', 'right'] } ] }
  apply(item) {
    this.objects.apply = item
  }

  // 'weapon', 'apparel'
  // TODO to: x (the pistol/a pistol/<specific pistol by id?>
  change(item) {
    this.objects.change = item
  }

  move(direction) {
    this.objects.move = direction
  }
}
const api = new API()

let config = {
  name: 'pipboy',
  // TODO mark default as local scope
  operators: [
    "([show] ([showable]))",
    "(([content]) [tab])",
    "([apply] ([stimpack]))",
    "([go] ([to2|to] ([showable|])))",
    "([change] ([changeable]))",
    "([weapon])",
    "([apparel])",
    "([move] ([direction]))",
    "([down])",
    "([up])",
  ],
  bridges: [
    { 
       id: "change", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: ({context, g}) => `change ${g(context.item)}`,
       semantic: ({api, context}) => {
         api.change(context.item.marker)
       }
    },
    { 
       id: "changeable", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "move", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), direction: after[0] }",
       generatorp: ({context, g}) => `move ${g(context.direction)}`,
       semantic: ({api, context}) => {
         api.move(context.direction)
       }
    },
    { 
       id: "direction", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "up", 
       level: 0, 
       isA: ['direction'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "down", 
       level: 0, 
       isA: ['direction'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "apparel", 
       level: 0, 
       isA: ['changeable'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "weapon", 
       level: 0, 
       words: ['weapons'],
       isA: ['changeable'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "apply", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: ({context, g}) => `apply ${g(context.item)}`,
       semantic: ({api, context}) => {
          // { item: 'stimpack', quantity: <number>, to?: [ { part: ['arm', 'leg', 'torso', head'], side?: ['left', 'right'] } ] }
         api.apply({ item: 'stimpack', quantity: 1 })
       }
    },
    { 
       id: "go", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), showable: after[0].showable }",
       generatorp: ({context, g}) => `go to ${g(context.showable)}`,
       semantic: ({api, context}) => {
         api.setDisplay(context.showable.value)
       }
    },
    {
       id: "to2", 
       isA: ['preposition'],
       level: 0, 
       bridge: "{ ...next(operator), showable: after[0] }",
       generatorp: ({context, g}) => `to ${g(context.showable)}`,
    },
    { 
       id: "show", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), showable: after[0] }",
       generatorp: ({context, g}) => `show ${g(context.showable)}`,
       semantic: ({api, context}) => {
         api.setDisplay(context.showable.value)
       }
    },
    { 
       id: "stimpack", 
       level: 0, 
       isA: ['theAble'],
       bridge: "{ ...next(operator) }" 
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
       words: [
                ['stat', 'stat'], 
                ['stats', 'stat'], 
                ['statistics', 'stat'], 
                ['inventory', 'inv'], 
                ['data', 'data'], 
                ['map', 'map'], 
                ['radio', 'radio'],
                ['status', 'status'],
                ['special', 'special'],
                ['perks', 'perks'],
                ['weapons', 'weapons'],
                ['apparel', 'apparel'],
                ['aid', 'aid'],
              ].map(
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
