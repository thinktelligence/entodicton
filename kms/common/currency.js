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
    // map currency word to the unit that will be put in the context
    getUnits: () => {
      return {
        'dollars': 'dollar', 
        'dollar': 'dollar',
        'pounds': 'pound',
        'pound': 'pound',
        'euros': 'euro', 
        'euro': 'euro'
      } 
    }
  }
};

let config = {
  operators: [
    "(([number]) [currency])",
  ],
  bridges: [
    { "id": "number", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "currency", "level": 0, "bridge": "{ ...next(operator), amount: before[0] }" },
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
    " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }" }],
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
  units = objects.interface.getUnits()
  for (word in units) {
    words = config.get('words')
    def = {"id": "currency", "initial": "{ units: '" + units[word] + "' }" }
    if (words[word]) {
      words[word].append(def)
    } else {
      words[word] = [def]
    }
  }
})

const isEntryPoint = () => {
    return require.main === module;
}

client.knowledgeModule( { 
  url,
  key,
  name: 'store',
  description: 'Ways of specifying currency amount',
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
