const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const base_km = require('./pipboyTemplate')
const countable = require('./countable')
const comparable = require('./comparable')
const pipboy_tests = require('./pipboy.test.json')

// start/stop listening
class API {
  initialize() {
  }
  // id in stats, inv, data, map, radio
  //      under stats: status, special, perks
  //      under inventory: weapons, apparel, aid
  setDisplay(id) {
    this.objects.display = id
  }

  showWeapons(id) {
    this.objects.showWeapons = id
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
    this.objects.disarm = true
  }

  drink(item) {
    this.objects.drink = item
  }

  eat(item) {
    this.objects.eat = item
  }

  take(item) {
    this.objects.take = item
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
  // show the shotguns / show all the weapons / show all weapons
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
    "([showWeapons|show] ([weapon]))",
    "(([content]) [tab])",
    "([apply] ([stimpak]))",
    "([go] ([to2|to] ([showable|])))",
    "([change] ([changeable]))",
    "([equip] ([equipable]))",
    "([toDrink|drink] ([drinkable]))",
    "([eat] ([edible]))",
    "([take] ([takeable]))",
    // "([weapon])",
    // "([44_pistol|])",
    "([apparel])",
    "((!articlePOS/0 && !verby/0) [outfit|outfit])",
    // this doesnt work because the speech recognizer hears 'where'
    "([wear] ([wearable]))",
    "([strip])",
    "([disarm])",
    "([putOn|] ([wearable]))",
    "(([put]) <on>)",
    "([call] ([nameable]) ([outfit]))",
    "((condition/1,2) <propertyCondition|> (weapon/1))",
    // "([call] ([outfit]) ([outfitName]))",
    // wear the city outfit / wear a suit / wear a suit and hat / wear that
    // call this the town outfit
    // call this the battle outfit
    // wear/show the town outfit
    // select an outfit
    // show the outfits

    // TODO for future
    // { pattern: "([testsetup1] ([equipable]))", development: true },
  ],
  hierarchy: [
    ['weapon', 'countable'],
    ['property', 'comparable'],
    // ['weapon', 'showable'],
  ],
  priorities: [
    [['to2', 0], ['articlePOS', 0]],
  ],
  bridges: [
    {
       id: "put", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator) }",
       generatorp: ({context, g}) => `put on`,
    },
    { 
       id: "propertyCondition", 
       before: ['adjective', 'articlePOS', 'the'],
       implicit: true,
       level: 0, 
       bridge: "{ ...next(after[0]), condition: before[0], modifiers: ['condition'] }",
    },
    { 
       id: "on", 
       isA: ['preposition'],
       level: 0, 
       bridge: "{ ...before, marker: operator('putOn', 0) }",
       generatorp: ({context, g}) => `put on ${g(context.item)}`,
       semantic: ({api, context}) => {
         api.change(context.item.marker)
       }
    },
    { 
       id: "change", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       localHierarchy: [ ['weapon', 'changeable'] ],
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
       id: "putOn", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: ({context, g}) => `put on ${g(context.item)}`,
       semantic: ({api, context}) => {
         if (context.item.name) {
           api.wear({ name: context.item.name.value, type: 'outfit' })
         } else {
           api.wear({ type: context.item.value })
         }
       }
    },
    { 
       id: "wear", 
       isA: ['verby'],
       words: ['where'], // the speech recognizer hears 'where' not 'wear'
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: ({context, g}) => `wear ${g(context.item)}`,
       semantic: ({api, context}) => {
         if (context.item.name) {
           api.wear({ name: context.item.name.value, type: 'outfit' })
         } else {
           api.wear({ type: context.item.value })
         }
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
         // const value = e(context.item)
         let condition
         if (context.item.condition) {
           condition = { selector: context.item.condition.marker, property: context.item.condition.property[0].marker }
         }
         api.equip({ type: context.item.value, condition })
       }
    },
    { 
       id: "toDrink", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: ({context, g}) => `drink ${g(context.item)}`,
       semantic: ({api, context, e}) => {
         const value = e(context.item)
         api.drink(value.value)
       }
    },
    { 
       id: "eat", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: ({context, g}) => `eat ${g(context.item)}`,
       semantic: ({api, context, e}) => {
         const value = e(context.item)
         api.eat(value.value)
       }
    },
    { 
       id: "take", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: ({context, g}) => `take ${g(context.item)}`,
       semantic: ({api, context, e}) => {
         const value = e(context.item)
         api.take(value.value)
       }
    },
    { 
       id: "nameable", 
       isA: ['theAble'],
       children: ['thisitthat'],
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "outfit", 
       isA: ['nameable', 'wearable'],
       level: 0, 
       bridge: "{ ...next(operator), name: before[0], modifiers: ['name'] }" 
    },
    { 
       id: "equipable", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "drinkable", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "edible", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "takeable", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "changeable", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    /*
    { 
       id: "44_pistol", 
       level: 0, 
       words: [' 44 pistol'],
       isA: ['pistol'],
       bridge: "{ ...next(operator) }" 
    },
    */
    { 
       id: "apparel", 
       level: 0, 
       isA: ['changeable'],
       bridge: "{ ...next(operator) }" 
    },
    /*
    { 
       id: "weapon", 
       level: 0, 
       words: ['weapons'],
       isA: ['changeable', 'equipable'],
       bridge: "{ ...next(operator) }" 
    },
    */
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
       id: "showWeapons", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), showable: after[0] }",
       generatorp: ({context, g}) => `show ${g(context.showable)}`,
       semantic: ({api, context}) => {
         if (context.showable.quantity && context.showable.quantity.value == 'all') {
           api.showWeapons('all')
         } else {
           api.showWeapons(context.showable.value)
         }
       }
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
    /*
    { 
       id: "testsetup1", 
       development: true,
       level: 0, 
       bridge: "{ ...next(operator), type: after[0] }" ,
       localHierarchy: [ ['weapon', 'equipable'] ],
       generatorp: ({context, g}) => `${context.marker} ${g(context.type)}`,
       isA: ['verby'],
       semantic: ({context, kms}) => {
         kms.dialogues.api.mentioned({
           marker: context.type.marker,
           value: context.type.marker
         })
       }
    },
    */
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
                // ['weapons', 'weapons'],
                ['apparel', 'apparel'],
                ['aid', 'aid'],
              ].map(
            ([word, value]) => { return { word, value } })
    },
  ],
};

/*
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
*/

config = new Config(config, module)
//console.log('base_km.config.hierarchy', JSON.stringify(base_km.config.hierarchy, null, 2))
config.add(base_km).add(countable).add(comparable)
// console.log('config.config.hierarchy', JSON.stringify(config.config.hierarchy, null, 2))
// console.log('config.hierarchy', config.hierarchy)
config.api = api

knowledgeModule({ 
  module,
  description: 'Control a pipboy with speech',
  config,
  test: {
    name: './pipboy.test.json',
    contents: pipboy_tests,
    check: [
      'apply', 'equip', 'change', 'wear', 'setName', 'showWeapons', 'display'
    ]
  },
})
