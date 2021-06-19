const entodicton = require('entodicton')
const currencyKM = require('./currency.js')
const helpKM = require('./help.js')
const { table } = require('table')
const _ = require('lodash')

const testData = {
  types: [ 'pants', 'shorts' ],
  products: [
    { marker: 'product', isInstance: true, type: 'pants', name: 'pants1', price: 9, id: 1 },
    { marker: 'product', isInstance: true, type: 'shirt', name: 'shirt1', price: 15, id: 2 },
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
  productGenerator: (uuid) => [({context}) => context.marker == 'product' && context.isInstance, ({g, context}) => `${context.name}`, uuid]
}

let config = {
  operators: [
    //"(([type]) [([(<less> ([than]))] ([amount]))])",
    //"(([show] ([listingType|])) <([for] (<the> ([listings])))>)",
    "([list] (<the> ([product|products])))",
    //"([list] ((<the> (([product|products]))) <(<that> ([cost] ([price])))>)) )"
    "(([product]) <(<that> ([cost] ([price])))>)",
    "([answer] ([with] ([listingType|])))",
    "([show] (<the> ([price])))",
    // move price before name
    // move price to the far right
    // show the price in euros
    // show the cost <-> price
    // show price as column 3
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

/*
    { "id": "show", "level": 0, "bridge": "{ ...next(operator), type: after[0] }" },
    { "id": "the", "level": 0, "bridge": "{ ...next(after[0]), instance: true }" },
    { "id": "for", "level": 0, "bridge": "{ ...next(operator), listable: after[0]}" },
    { "id": "for", "level": 1, "bridge": "{ ...next(before[0]), listable: operator.after[0]}" },
*/

    { "id": "listingType", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "with", "level": 0, "bridge": "{ ...next(operator), type: after[0].value }" },
    { "id": "answer", "level": 0, "bridge": "{ ...next(operator), type: after[0].type }" },

    { "id": "price", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "show", "level": 0, "bridge": "{ ...next(operator), properties: after[0] }" },
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
    "tables": [{"id": "listingType", "initial": "{ value: 'tables' }" }],
    "sentences": [{"id": "listingType", "initial": "{ value: 'sentences' }" }],
    //" ([0-9]+)": [{"id": "amount", "initial": "{ value: int(group[0]) }" }],
  },

  generators: [
    [ 
      ({context, objects}) => context.marker == 'show',
      ({objects, gs}) => `the properties being shown are ${gs(objects.listing.columns)}` 
    ],
    [ ({context}) => context.marker == 'product' && !context.isInstance, ({context}) => `the ${context.word}` ],
    [ ({context}) => context.marker == 'list' && !context.isResponse, ({g, context}) => `list ${g(context.what)}` ],
    [ 
      ({context, objects}) => objects.listing.type == 'sentences' && context.marker == 'list' && context.isResponse, 
      ({g, gs, context}) => `${g(context.what)} are ${gs(context.listing, ' ', ' and ')}` 
    ],
    [ 
      ({context, objects}) => objects.listing.type == 'tables' && context.marker == 'list' && context.isResponse, 
      ({g, gs, objects, context}) => {
        let report = '';
        const products = context.listing
        const columns = objects.listing.columns
        const data = products.map( (product) => {
                const row = []
                for (property of columns) {
                  row.push(product[property])
                }
                return row
               });
        report += table([columns].concat(data))
        return report
      }
    ],
    [ 
      ({context}) => context.marker == 'answer', 
      ({g, context}) => `answering with ${context.type}` 
    ],
  ],

  semantics: [
    [ 
      ({context, objects}) => context.marker == 'show',
      ({objects, context}) => {
        objects.listing.columns.push(context.properties.marker)
        objects.listing.columns = _.uniq(objects.listing.columns)
      }
    ],
    [
      ({objects, context}) => context.marker == 'list', 
      async ({objects, context, api}) => {
        context.listing = api.getAllProducts()
        context.isResponse = true
      }
    ],
    [
      ({context}) => context.marker == 'answer', 
      async ({objects, context, api}) => {
        objects.listing = objects.listing || {}
        objects.listing.type = context.type
      }
    ],
  ],
};

// ['list products']
//config.utterances = ['shirts less than 10 dollars']
// shirts less than 10 dollars
// shirts not more than 10 dollars
// pants that are exactly $10
config = new entodicton.Config(config).add(currencyKM).add(helpKM)
config.api = api
config.initializer( ({objects, api, uuid}) => {
  api.getTypes().forEach( (type) => {
    words = config.get('words')
    def = {"id": "product", "initial": "{ value: '" + type + "' }", uuid }
    if (words[type]) {
      words[type].push(def)
    } else {
      words[type] = [def]
    }
    objects.listing = { 
      type: 'tables',
      columns: ['name'],
    }
  })
  config.get('generators').push( api.productGenerator(uuid) )
})

entodicton.knowledgeModule({
  module,
  name: 'store',
  description: 'questions about products for sale in a store',
  config,
  test: './store.test',
})
