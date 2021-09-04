const entodicton = require('entodicton')
const currencyKM = require('./currency.js')
const helpKM = require('./help.js')
const { table } = require('table')
const _ = require('lodash')

const testData = {
  name: 'clothes',
  types: [ 'pants', 'shorts' ],
  products: [
    { marker: 'clothes', isInstance: true, type: 'pants', name: 'pants1', price: 9, id: 1 },
    { marker: 'clothes', isInstance: true, type: 'shirt', name: 'shirt1', price: 15, id: 2 },
  ]
}

const api = {
  getName: () => testData.name,
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
  productGenerator: [({context}) => context.marker == 'clothes' && context.isInstance, ({g, context}) => `${context.name}`]
}

let config = {
  name: 'reports',
  operators: [
    //"(([type]) [([(<less> ([than]))] ([amount]))])",
    //"(([show] ([listingType|])) <([for] (<the> ([listings])))>)",
    "([listAction|list] (<the> ([product|products])))",
    //"what can you report on",
    //"([list] ((<the> (([product|products]))) <(<that> ([cost] ([price])))>)) )"
    "([reportAction|report] ([on] ([reportObject|])))",
    "(([product]) <(<that> ([cost] ([price])))>)",
    "([answer] ([with] ([listingType|])))",
    "([show] (<the> ([price])))",
    // save this as report1 / show report1
    // move price before name
    // move price to the far right
    // show the price in euros
    // show the cost <-> price
    // move column 2 to column 3
    // the price columns two to the left / to the far rigth
    // show price as column 3
    // call this report report1
  ],
  bridges: [
    { "id": "product", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "listAction", "level": 0, "bridge": "{ ...next(operator), what: after}" },

    { "id": "reportObject", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "on", "level": 0, "bridge": "{ ...next(operator), report: after[0] }" },
    { "id": "reportAction", "level": 0, "bridge": "{ ...next(operator), report: after[0].report }" },

    { "id": "that", "level": 0, "bridge": "{ ...*, constraint: context }" },
    { "id": "cost", "level": 0, "bridge": "{ ...next(operator), price: after[0] }" },
    { "id": "cost", "level": 1, "bridge": "{ ...squish(operator), thing*: before[0] }" },
    { "id": "price", "level": 0, "bridge": "{ ...next(operator) }" },

    { "id": "listingType", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "with", "level": 0, "bridge": "{ ...next(operator), type: after[0].value }" },
    { "id": "answer", "level": 0, "bridge": "{ ...next(operator), type: after[0].type }" },

    { "id": "show", "level": 0, "bridge": "{ ...next(operator), properties: after[0] }" },
  ],
  hierarchy: [
  ],
  associations: {
  },
  priorities: [
  ],
  floaters: ["api", "isQuery"],
  debug: true,
  priorities: [
    [['listAction', 0], ['cost', 1]]
  ],
  "version": '3',
  "words": {
    "tables": [{"id": "listingType", "initial": "{ value: 'tables' }" }],
    "sentences": [{"id": "listingType", "initial": "{ value: 'sentences' }" }],
    //"product1": [{"id": "reportObject", "initial": "{ value: 'api1' }" }],
    //"api2": [{"id": "reportObject", "initial": "{ value: 'api2' }" }],
    //" ([0-9]+)": [{"id": "amount", "initial": "{ value: int(group[0]) }" }],
  },

  priorities: [
    [['answer', 0], ['listAction', 0], ['the', 0], ['with', 0]]
  ],
  generators: [
    [ 
      ({context, objects}) => context.marker == 'show',
      ({gs, api}) => `the properties being shown are ${gs(api.listing.columns)}` 
    ],
    [ ({context}) => context.marker == 'reportAction' && context.response, ({context, g}) => `reporting on ${context.report.word}` ],
    [ ({context}) => context.marker == 'reportAction' && context.paraphrase, ({context, g}) => `report on ${context.report.word}` ],
    [ ({context}) => context.marker == 'product' && !context.isInstance, ({context}) => `the ${context.word}` ],
    [ ({context}) => context.marker == 'listAction' && !context.response, ({g, context}) => `list ${g(context.what)}` ],
    [ 
      ({context, api}) => api.listing.type == 'sentences' && context.marker == 'listAction' && context.response, 
      ({g, gs, context}) => {
        gs(context.listing) 
        return `${g(context.what)} are ${gs(context.listing, ' ', ' and ')}` 
      }
    ],
    [ 
      ({context, api}) => api.listing.type == 'tables' && context.marker == 'listAction' && context.response, 
      ({g, gs, objects, context}) => {
        let report = '';
        const products = context.listing
        const columns = api.listing.columns
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
      ({context, objects}) => context.marker == 'reportAction',
      ({objects, context, api}) => {
        context.response = true;
        api.current = context.report.marker
      }
    ],
    [ 
      ({context, objects}) => context.marker == 'show',
      ({api, context}) => {
        api.listing.columns.push(context.properties.marker)
        api.listing.columns = _.uniq(api.listing.columns)
      }
    ],
    [
      ({context}) => context.marker == 'listAction', 
      ({context, api, config}) => {
        if (context.api) {
          context.listing = config._api.apis[context.api].getAllProducts()
        } else {
          context.listing = config._api.apis[config._api.current].getAllProducts()
        }
        context.response = true
      },
    ],
    [
      ({context}) => context.marker == 'answer', 
      ({api, context}) => {
        api.listing = api.listing || {}
        api.listing.type = context.type
      }
    ],
  ],
};

const testData2 = {
  name: 'models',
  types: [ 'tanks', 'planes' ],
  products: [
    { marker: 'models', isInstance: true, type: 'tanks', name: 'tiger', price: 9, id: 1 },
    { marker: 'models', isInstance: true, type: 'planes', name: 'spitfire', price: 15, id: 2 },
  ]
}

const api2 = {
  getName: () => testData2.name,
  getTypes: () => testData2.types,
  getAllProducts: () => testData2.products,
  getByTypeAndCost: ({type, cost, comparison}) => {
    results = []
    testData2.forEach( (product) => {
      if (product.type == type && comparison(product.cost)) {
        results.push(product)
      }
    })
    return results
  },
  productGenerator: [
    ({context}) => {
      return context.marker == 'models' && context.isInstance
    },
    ({g, context}) => `${context.name}`
  ]
}

const initializeApi = (config, api) => {
  const type = api.getName();
  config.addWord(type, {"id": "product", "initial": "{ value: '" + type + `', api: '${type}'}` })
  api.listing = { 
    type: 'tables',
    columns: ['name'],
  }
  config.addGenerator( ...api.productGenerator )
  const open = '{'
  const close = '}'
  config.addWord(type, {"id": "reportObject", "initial": `${open} value: '${type}' ${close}` })
 }

config = new entodicton.Config(config).add(currencyKM).add(helpKM)
config.multiApi = initializeApi
// mode this to non-module init only
config.api = api2
config.api = api
entodicton.knowledgeModule({
  module,
  description: 'this module is for getting info about a concept with properties',
  config,
  test: './reports.test',
})
