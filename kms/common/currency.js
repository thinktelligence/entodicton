const entodicton= require('entodicton')
const Digraph = require('entodicton/src/digraph')
const numbersKM = require('./numbers.js')

const testData = {
  types: [ 'pants', 'shorts' ],
  products: [
    { marker: 'product', isInstance: true, type: 'pants', name: 'pants1', cost: 9, id: 1 },
    { marker: 'product', isInstance: true, type: 'shirt', name: 'shirt1', cost: 15, id: 2 },
  ]
}

const api = {
  // map currency word to the unit that will be put in the context
  getUnits: () => {
    return {
      'dollars': 'dollar', 
      'dollar': 'dollar',
      'pounds': 'pound',
      'pound': 'pound',
      'euros': 'euro', 
      'euro': 'euro',
    } 
  },

  getUnitWords: () => {
    return [
      { units: 'dollar', one: 'dollar', many: 'dollars' },
      { units: 'pound', one: 'pound', many: 'pounds' },
      { units: 'euro', one: 'euro', many: 'euros' },
    ]
  },

  convertTo: (amount, fromUnits, toUnits) => {
    const conversion = {
    "dollar": { "euro": 0.82, "pound": 0.71, },
    "euro": { "dollar": 1.22, "pound": 0.82, },
    "pound": { "dollar": 1.42, "euro": 1.16, },
    }
    return conversion[fromUnits][toUnits] * amount
  }
}

let config = {
  operators: [
    "(([number]) [currency])",
    "((currency/1) [in] (currency/0))",
  ],
  bridges: [
    { "id": "currency", "level": 0, "bridge": "{ ...next(operator), amount: before[0] }" },
    { "id": "currency", "level": 1, "bridge": "{ ...next(operator) }" },
    { "id": "in", "level": 0, "bridge": "{ ...next(operator), from: before[0], to: after[0] }" },
  ],
  hierarchy: [
  ],
  associations: {
  },
  floaters: ['isQuery'],
  debug: true,
  priorities: [
  ],
  "version": '3',
  "words": {
  },

  generators: [
    [ ({context}) => context.marker == 'currency' && !context.isAbstract, ({context, g}) => {
      word = Object.assign({}, context.amount)
      word.isAbstract = true
      word.marker = 'currency'
      word.units = context.units
      word.value = context.amount.value
      // generator = [({context}) => context.marker == 'currency' && context.units == words.units && context.value > 1 && context.isAbstract, ({context, g}) => words.many ]
      return `${g(context.amount.value)} ${g(word)}`
    } ],
  ],

  semantics: [
    [({objects, context}) => context.marker == 'list', async ({api, context}) => {
      context.listing = api.getAllProducts()
      context.isResponse = true
    }],

    [({objects, context}) => context.marker == 'in', async ({objects, api, context}) => {
      const from = context.from
      const to = context.to
      const value = api.convertTo(from.amount.value, from.units, to.units)
      context.marker = 'currency'
      context.isAbstract = false
      context.amount = { value }
      context.units = to.units
      context.isResponse = true
    }],
  ],
};

config = new entodicton.Config(config)
config.add(numbersKM)
config.api = api
config.initializer( ({config, objects, api, uuid}) => {
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
      generators = config.get('generators')
      generator = [({context}) => context.marker == 'currency' && context.units == words.units && context.value == 1 && context.isAbstract, ({context, g}) => words.one, uuid ]
      generators.push(generator)
      generator = [({context}) => context.marker == 'currency' && context.units == words.units && !isNaN(context.value) && (context.value != 1) && context.isAbstract, ({context, g}) => words.many, uuid ]
      generators.push(generator)
  }
})

const isEntryPoint = () => {
    return require.main === module;
}

entodicton.knowledgeModule( { 
  name: 'currency',
  description: 'Ways of specifying currency amount',
  config,
  isProcess: require.main === module,
  test: './currency.test',
  setup: () => {
  },
  process: (promise) => {
    return promise
      .then( async (responses) => {
        if (responses.errors) {
          console.log('Errors')
          responses.errors.forEach( (error) => console.log(`    ${error}`) )
        }
        console.log('This is the global objects from running semantics:\n', config.objects)
        if (responses.logs) {
          console.log('Logs')
          responses.logs.forEach( (log) => console.log(`    ${log}`) )
        }
        console.log(responses.trace);
        console.log('objects', JSON.stringify(config.get("objects"), null, 2))
        console.log(responses.generated);
        console.log(JSON.stringify(responses.results, null, 2));
      })
      .catch( (error) => {
        console.log(`Error ${config.get('utterances')}`);
        console.log('error', error)
        console.log('error.error', error.error)
        console.log('error.context', error.context)
        console.log('error.logs', error.logs);
        console.log('error.trace', error.trace);
      })
  },
  module: () => {
    module.exports = config
  }
})
