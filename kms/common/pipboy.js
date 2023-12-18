const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const base_km = require('./hierarchy')
const countable = require('./countable')
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

  // { item: 'stimpak', quantity: <number>, to?: [ { part: ['arm', 'leg', 'torso', head'], side?: ['left', 'right'] } ] }
  apply(item) {
    this.objects.apply = item
  }

  setName(item, name) {
    this.objects.setName = { item, name }
  }

  strip() {
    this.objects.strip = true
  }

  disarm() {
    this.objects.disarm= true
  }

  wear(item) {
    this.objects.wear = item
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
  // apply all the stimpaks
  // show the highest damage guns
  // show the guns with the highest value
  // select a rifle
  // select a rifle with the most damage
  // wear a suit
  // apply a stimpak
  //
  // call this outfit the town outfit
  // call this outfit snappy dresser
  // call this gun blastey
  // call this the battle outfit
  // wear the town outfit
  // select an outfit
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
    "([apply] ([stimpak]))",
    "([go] ([to2|to] ([showable|])))",
    "([change] ([changeable]))",
    "([equip] ([equipable]))",
    "([weapon])",
    "([44_pistol|])",
    "([apparel])",
    "((!articlePOS/0 && !verby/0) [outfit|outfit])",
    "([wear] ([outfit]))",
    "([strip])",
    "([disarm])",
    "([call] ([nameable]) ([outfit]))",
    // "([call] ([outfit]) ([outfitName]))",
    // wear the city outfit / wear a suit / wear a suit and hat / wear that
    // call this the town outfit
    // call this the battle outfit
    // wear/show the town outfit
    // select an outfit
    // show the outfits

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
       id: "disarm", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator) }",
       generatorp: ({context, g}) => `disarm`,
       semantic: ({api, context}) => {
         api.disarm()
       }
    },
    { 
       id: "strip", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator) }",
       generatorp: ({context, g}) => `strip`,
       semantic: ({api, context}) => {
         api.strip()
       }
    },
    { 
       id: "call", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0], name: after[1] }",
       generatorp: ({context, g}) => `call ${g(context.item)} ${g(context.name)}`,
       semantic: ({api, context}) => {
         api.setName(context.item, context.name.name.value)
       }
    },
    { 
       id: "wear", 
       isA: ['verby'],
       words: ['where'], // speech recognizer is funky that is why
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: ({context, g}) => `wear ${g(context.item)}`,
       semantic: ({api, context}) => {
         api.wear(context.item.name.value)
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
    /*
    { 
       id: "call", 
       isA: ['theAble'],
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "outfit", 
       isA: ['theAble'],
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    */
    { 
       id: "nameable", 
       isA: ['theAble'],
       children: ['thisitthat'],
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "outfit", 
       isA: ['nameable'],
       level: 0, 
       bridge: "{ ...next(operator), name: before[0], modifiers: ['name'] }" 
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
       semantic: ({api, context, e}) => {
          // { item: 'stimpak', quantity: <number>, to?: [ { part: ['arm', 'leg', 'torso', head'], side?: ['left', 'right'] } ] }
         const quantity = context.item.quantity ? e(context.item.quantity).value : 1
         api.apply({ item: 'stimpak', quantity })
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
       id: "stimpak", 
       level: 0, 
       words: ['stimpaks', 'stimpack', 'stimpacks'],
       isA: ['theAble', 'countable'],
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
       development: true,
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

const addWeapon = (id) => {
  config.operators.push(`([${id}])`)
  config.bridges.push({ 
       id,
       level: 0, 
       isA: ['weapon', 'theAble'],
       bridge: "{ ...next(operator) }" 
  })
}
addWeapon('pistol')
addWeapon('rifle')

config = new Config(config, module)
config.add(base_km).add(countable)
config.api = api

knowledgeModule({ 
  module,
  description: 'Control a pipboy with speech',
  config,
  test: {
    name: './pipboy.test.json',
    contents: pipboy_tests,
    check: [
      'apply', 'equip', 'change', 'wear', 'setName'
    ]
  },
})
