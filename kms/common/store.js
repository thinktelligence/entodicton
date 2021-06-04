const entodicton = require('entodicton')
const currencyKM = require('./currency.js')

const testData = {
  types: [ 'pants', 'shorts' ],
  products: [
    { marker: 'product', isInstance: true, type: 'pants', name: 'pants1', cost: 9, id: 1 },
    { marker: 'product', isInstance: true, type: 'shirt', name: 'shirt1', cost: 15, id: 2 },
  ]
}

const api = {
  getTypes: () => testData.types,
  getAllProducts: () => testData.products,
  getByTypeAndCost: ({type, cost, comparison}) => {
    results = []
    testData.forEach( (product) => {
      if (product.type == type && comparison(product.cost)) {
        results.push(product)
      }
    })
    return results
  },
  productGenerator: [({context}) => context.marker == 'product' && context.isInstance, ({g, context}) => `${context.name}`]
}

let config = {
  operators: [
    //"(([type]) [([(<less> ([than]))] ([amount]))])",
    "([list] (<the> (([product|products]))))",
    //"([list] ((<the> (([product|products]))) <(<that> ([cost] ([price])))>)) )"
    "(([product]) <(<that> ([cost] ([price])))>)",
  ],
  bridges: [
    { "id": "product", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "the", "level": 0, "bridge": "{ ...after, pullFromContext: true }" },
    { "id": "list", "level": 0, "bridge": "{ ...next(operator), what: after}" },

    //{ "id": "that", "level": 0, "bridge": "{ ...next(operator), operator.passthrough: true }" },
    //{ "id": "that", "level": 0, "bridge": "{ ...after, operator.passthrough: true }" },
    { "id": "that", "level": 0, "bridge": "{ ...*, constraint: context }" },
    { "id": "cost", "level": 0, "bridge": "{ ...next(operator), price: after[0] }" },
    { "id": "cost", "level": 1, "bridge": "{ ...squish(operator), thing*: before[0] }" },
    { "id": "price", "level": 0, "bridge": "{ ...next(operator) }" },
  ],
  hierarchy: [
  ],
  associations: {
  },
  floaters: ['isQuery'],
  debug: true,
  priorities: [
    [['list', 0], ['cost', 1]]
  ],
  "version": '3',
  "words": {
    //" ([0-9]+)": [{"id": "amount", "initial": "{ value: int(group[0]) }" }],
  },

  generators: [
    [ ({context}) => context.marker == 'product' && !context.isInstance, ({context}) => `the ${context.word}` ],
    [ ({context}) => context.marker == 'list' && !context.isResponse, ({g, context}) => `list ${g(context.what)}` ],
    [ ({context}) => context.marker == 'list' && context.isResponse, ({g, gs, context}) => `${g(context.what)} are ${gs(context.listing, ' ', ' and ')}` ],
  ],

  semantics: [
    [({objects, context}) => context.marker == 'list', async ({objects, context, api}) => {
      context.listing = api.getAllProducts()
      context.isResponse = true
    }],
  ],
};

url = "http://184.67.27.82"
key = "6804954f-e56d-471f-bbb8-08e3c54d9321"
//url = "http://localhost:3000"
//key = "6804954f-e56d-471f-bbb8-08e3c54d9321"

// ['list products']
//config.utterances = ['shirts less than 10 dollars']
// shirts less than 10 dollars
// shirts not more than 10 dollars
// pants that are exactly $10

config = new entodicton.Config(config).add(currencyKM)
console.dir(config.config)
config.api = api
config.initializer( ({objects, api}) => {
  api.getTypes().forEach( (type) => {
    words = config.get('words')
    def = {"id": "product", "initial": "{ value: '" + type + "' }" }
    if (words[type]) {
      words[type].push(def)
    } else {
      words[type] = [def]
    }
  })
  config.get('generators').push( api.productGenerator )
})

const isEntryPoint = () => {
    return require.main === module;
}

entodicton.knowledgeModule( { 
  url,
  key,
  name: 'store',
  description: 'questions about products for sale in a store',
  config,
  isProcess: require.main === module,
  test: './store.test',
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
//        return promise;
      })
      .catch( (error) => {
        console.log(`Error ${config.get('utterances')}`);
        console.log('error', error)
        console.log('error.error', error.error)
        console.log('error.context', error.context)
        console.log('error.logs', error.logs);
        console.log('error.trace', error.trace);
//        return promise;
      })
  },
  module: () => {
    console.log('yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy in the module')
    module.exports = config
  }
})
