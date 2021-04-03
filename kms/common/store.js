const client = require('entodicton/client')
const Config = require('entodicton/src/config')
const Digraph = require('entodicton/src/digraph')

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
    getTypes: () => testData.types,
    getAllProducts: () => testData.products,
    getByTypeAndCost: ({type, cost, comparison}) => {
      results = []
      testData.forEach( (product) => {
        if (product.type == type && comparison(product.cost)) {
          results.append(product)
        }
      })
      return results
    },
    productGenerator: [({context}) => context.marker == 'product' && context.isInstance, ({g, context}) => `${context.name}`]
  }
};

let config = {
  operators: [
    //"(([type]) [([(<less> ([than]))] ([amount]))])",
    "([list] ([product|products]))"
  ],
  bridges: [
    { "id": "product", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "list", "level": 0, "bridge": "{ ...next(operator), what: after}" },
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
    //" ([0-9]+)": [{"id": "amount", "initial": "{ value: int(group[0]) }" }],
  },

  generators: [
    [ ({context}) => context.marker == 'product' && !context.isInstance, ({context}) => `the ${context.word}` ],
    [ ({context}) => context.marker == 'list' && !context.isResponse, ({g, context}) => `list ${g(context.what)}` ],
    [ ({context}) => context.marker == 'list' && context.isResponse, ({g, gs, context}) => `${g(context.what)} are ${gs(context.listing, ' ', ' and ')}` ],
  ],

  semantics: [
    [({objects, context}) => context.marker == 'list', async ({objects, context}) => {
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      console.log(objects.interface.getAllProducts())
      context.listing = objects.interface.getAllProducts()
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

config.objects = objects;
config = new Config(config)
config.initializer( (config) => {
  const objects = config.get('objects')
  objects.interface.getTypes().forEach( (type) => {
    words = config.get('words')
    def = {"id": "product", "initial": "{ value: '" + type + "' }" }
    if (words[type]) {
      words[type].append(def)
    } else {
      words[type] = [def]
    }
  })
  config.get('generators').push( objects.interface.productGenerator )
})

const isEntryPoint = () => {
    return require.main === module;
}

client.knowledgeModule( { 
  url,
  key,
  config,
  isProcess: require.main === module,
  test: './store.test',
  setup: () => {
  },
  process: () => {
    return client.process(url, key, config, { writeTests: true, testsFn: './store.test', skipGenerators: true })
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
        console.log('error.error', error.error)
        console.log('error.context', error.context)
        console.log('error.logs', error.logs);
        console.log('error.trace', error.trace);
      })
  },
  module: () => {
    console.log('yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy in the module')
    module.exports = config
  }
})
