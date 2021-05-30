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

const objects = {
  // Interface methods use to customize the interpretation
  interface: {
    currency: {
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

      conversion: {
        "dollar": {
          "euro": 0.82,
          "pound": 0.71,
        },
        "euro": {
          "dollar": 1.22,
          "pound": 0.82,
        },
        "pound": {
          "dollar": 1.42,
          "euro": 1.16,
        },
      },

      convertTo: (amount, fromUnits, toUnits) => {
        return convertions[fromUnits] * amount
      }
    }
  }
};

let config = {
  operators: [
    "(([number]) [currency])",
    //"(([currencyAmount/1]) [in] ([currencyType]))",
  ],
  bridges: [
    { "id": "currency", "level": 0, "bridge": "{ ...next(operator), amount: before[0] }" },
    //{ "id": "currencyType", "level": 0, "bridge": "{ ...next(operator) }" },
    //{ "id": "in", "level": 0, "bridge": "{ ...next(operator), from: before[0], to: after[0] }" },
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
      return `${g(context.amount)} ${g(word)}`
    } ],
  ],

  semantics: [
    [({objects, context}) => context.marker == 'list', async ({objects, context}) => {
      context.listing = objects.interface.currency.getAllProducts()
      context.isResponse = true
    }],
  ],
};

url = "http://184.67.27.82"
key = "6804954f-e56d-471f-bbb8-08e3c54d9321"
//url = "http://localhost:3000"
//key = "6804954f-e56d-471f-bbb8-08e3c54d9321"

config.objects = objects;
config = new entodicton.Config(config)
config.add(numbersKM)

config.initializer( ({objects}) => {
  units = objects.interface.currency.getUnits()
  for (word in units) {
    words = config.get('words')
    def = {"id": "currency", "initial": { units: units[word] }}
    if (words[word]) {
      words[word].push(def)
    } else {
      words[word] = [def]
    }
  }

  unitWords = objects.interface.currency.getUnitWords();
  for (let words of unitWords) {
      generators = config.get('generators')
      generator = [({context}) => context.marker == 'currency' && context.units == words.units && context.value == 1 && context.isAbstract, ({context, g}) => words.one ]
      generators.push(generator)
      generator = [({context}) => context.marker == 'currency' && context.units == words.units && context.value > 1 && context.isAbstract, ({context, g}) => words.many ]
      generators.push(generator)
  }
})

const isEntryPoint = () => {
    return require.main === module;
}

entodicton.knowledgeModule( { 
  url,
  key,
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
