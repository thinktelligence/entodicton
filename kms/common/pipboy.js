const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const base_km = require('./hierarchy')
const pipboy_tests = require('./pipboy.test.json')

class API {
  initialize() {
  }
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

  equip(item) {
    this.objects.equip = item
  }
  // wear/arm with default that
  // 'weapon', 'apparel'
  // TODO to: x (the pistol/a pistol/<specific pistol by id?>
  // add to favorite
  // equip/arm
  //   equip a pistol
  //   equip the 44 pistol
  // eat/use
  //   eat some food
  // show the highest damage guns
  // show the guns with the highest value
  // select a rifle
  // select a rifle with the most damage
  // wear a suit
  // apply a stimpack
  // call this the town outfit
  // call this the battle outfit
  // 
  change(item) {
    this.objects.change = item
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
    "([equip] ([equipable]))",
    "([weapon])",
    "([pistol])",
    "([44_pistol|])",
    "([apparel])",

    { pattern: "([testsetup1] ([equipable]))", development: true },
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
       id: "equip", 
       isA: ['verby'],
       level: 0, 
       localHierarchy: [ ['weapon', 'equipable'], ['thisitthat', 'equipable'] ],
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: ({context, g}) => `equip ${g(context.item)}`,
       semantic: ({api, context, e}) => {
         const value = e(context.item)
         api.equip(value.value)
       }
    },
    { 
       id: "equipable", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "changeable", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "pistol", 
       level: 0, 
       isA: ['weapon', 'theAble'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "44_pistol", 
       level: 0, 
       words: [' 44 pistol'],
       isA: ['pistol'],
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
       isA: ['changeable', 'equipable'],
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
       id: "testsetup1", 
       level: 0, 
       bridge: "{ ...next(operator), type: after[0] }" ,
       generatorp: ({context, g}) => `${context.marker} ${g(context.type)}`,
       isA: ['verby'],
       semantic: ({context, kms}) => {
         kms.dialogues.api.mentioned({
           marker: context.type.marker,
           value: context.type.marker
         })
       }
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
};

config = new Config(config, module)
config.add(base_km)
config.api = api

knowledgeModule({ 
  module,
  description: 'Control a pipboy with speech',
  config,
  test: {
    name: './pipboy.test.json',
    contents: pipboy_tests,
    check: [
      'apply', 'equip', 'change'
    ]
  },
})
