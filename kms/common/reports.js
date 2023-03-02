const entodicton = require('entodicton')
const currencyKM = require('./currency.js')
const math = require('./math.js')
const helpKM = require('./help.js')
const { propertyToArray, wordNumber } = require('./helpers')
const { table } = require('table')
const _ = require('lodash')
const reports_tests = require('./reports.test.json')
const { v4 : uuidv4, validate : validatev4 } = require('uuid');

/*
  show supplier on report1
  show supplier (on current report)
*/

/* START USER DEFINED: this part could be calling your backend db */

const compareValue = (property, v1, v2) => {
  return v1[property] < v2[property] ? -1 :
         v1[property] > v2[property] ? 1 :
         0;
}

let tempReportId = 0

const newReport = ({km, objects}) => {
  tempReportId += 1
  const reportId = `tempReport${tempReportId}`
  km('dialogues').api.mentioned({ marker: "report", text: reportId, types: [ "report" ], value: reportId, word: reportId })
  // name to listing
  objects.listings[reportId] = {
      columns: ['name', 'supplier'],
      ordering: [],
      type: 'tables',
  }
  return reportId
}

const compareObject = (ordering) => (v1, v2) => {
  for (let order of ordering) {
    c = compareValue(order[0], v1, v2)
    if (c == 0) {
      continue
    }
    if (order[1] == 'descending') {
      c *= -1
    }
    return c
  }
  return 0
}

const sort = ({ ordering, list }) => {
  return list.sort(compareObject(ordering))
}

const testData = {
  name: 'clothes',
  types: [ 'pants', 'shorts' ],
  products: [
    { marker: 'clothes', supplier: "x industries", isInstance: true, type: 'pants', name: 'pants1', price: 9, id: 1, quantity: 4 },
    { marker: 'clothes', supplier: "y industries", isInstance: true, type: 'shirt', name: 'shirt1', price: 15, id: 2, quantity: 6 },
  ],
}

const testData2 = {
  name: 'models',
  types: [ 'tanks', 'planes' ],
  products: [
    { marker: 'models', supplier: "tamiya", isInstance: true, type: 'tanks', name: 'tiger', price: 9, id: 1, quantity: 3 },
    { marker: 'models', supplier: "dragon", isInstance: true, type: 'planes', name: 'spitfire', price: 15, id: 2, quantity: 7 },
  ]
}

const apiTemplate = (marker, testData) => { 
  return {
    getName: () => testData.name,
    getTypes: () => testData.types,
    getAllProducts: ({ columns, ordering }) => sort({ ordering, list: testData.products }),
    getByTypeAndCost: ({type, cost, comparison}) => {
      results = []
      testData.forEach( (product) => {
        if (product.type == type && comparison(product.cost)) {
          results.push(product)
        }
      })
      return results
    },
    productGenerator: [({context}) => context.marker == marker && context.isInstance, ({g, context}) => `${context.name}`]
  }
}

/* END USER DEFINED: this part could be calling your backend db */

const api1 = apiTemplate('models', testData2)
const api2 = apiTemplate('clothes', testData)

let config = {
  name: 'reports',
  operators: [
    //"(([type]) [([(<less> ([than]))] ([amount]))])",
    //"(([show] ([listingType|])) <([for] (<the> ([listings])))>)",
    "([listAction|list] (<the> ([product|products])))",
    //"what can you report on",
    //"([list] ((<the> (([product|products]))) <(<that> ([cost] ([price])))>)) )"
    "([reportAction|report] ([on] ([report|])))",
    "(([product]) <(<that> ([cost] ([price])))>)",
    "([answer] ([with] ([listingType|])))",
    "([show] (<the> ([property])))",
    "([call] ([this]) (rest))",
    "(([property]) <ascending>)",
    "(([property]) <descending>)",
    "([describe] ([report]))",
    "([price])",
    "([quantity])",
    "([ordering])",
    "([show:reportBridge] ([report]))",
    "([column] ([number]))",
    "([move] ([column]) ([to] ([column])))",
    /*
       call this the banana report
       show the banana report
       price descending
       price ascending
    */
    // DONE show price and quantity
    // DONE describe report1
    // -> multi word report names
    // call this report a  show report a show report a for products that code more than 10 dollars
    // DONE show the models
    // save this as report1 / show report1
    // list the products with the price descending
    // show the report before
    // show report1 with price descending

    // column 2 / the price column
    // left / left 2 / to the left / to the left 2
    // move [column] to [column]
    // move [column] [direction]
    // move [column] to [direction]
    // move [column] before/after [column]
    // move the price column before the name column
    // move column 2 left
    // move column 2 left 2
    // move column 2 to 1
    // move price before name
    // move price to the far right
    // move column 2 to column 3
    // call it report1 move column 2 to column 3 show it

    // worth means quanity times price
    // show the price in euros
    // show the cost <-> price
    // the price columns two to the left / to the far rigth
    // show price as column 3
    // call this report report1
  ],
  bridges: [
    { id: "move", level: 0, 
        bridge: "{ ...next(operator), on: { marker: 'report', pullFromContext: true }, from: after[0], to: after[1] }",
        generatorp: ({context, gp}) => `move ${gp(context.from)} ${gp(context.to)}`,
        semantic: ({context, e, objects, apis}) => {
          const report = e(context.on)
          const listing = objects.listings[report.value]

          const from = context.from.index.value;
          const to = context.to.object.index.value;
          const old = listing.columns[from-1]
          listing.columns[from-1] = listing.columns[to-1]
          listing.columns[to-1] = old
        }
    },
    { id: "column", level: 0, 
        bridge: "{ ...next(operator), index: after[0] }",
        generatorp: ({context, gp}) => `column ${gp(context.index)}`,
    },
    { id: "ordering", level: 0, bridge: "{ ...next(operator) }" },
    { id: "report", level: 0, 
            isA: ['theAble'], 
            words: [{word: "reports", number: "many"}], 
            bridge: "{ ...next(operator) }",
            generator: {
              match: ({context}) => context.marker == 'report' && context.describe,
              apply: ({context, apis, gp, gs, objects}) => {
                const listings = objects.listings[context.value]
                // {"type":"tables","columns":["name"],"ordering":[]}
                return `for ${listings.api}, showing the ${wordNumber('property', listings.columns.length > 1)} ${gs(listings.columns, ' ', ' and ')} as ${listings.type}`
              }
            },
    },

    { id: "ascending", level: 0, bridge: "{ ...before[0], ordering: 'ascending' }" },
    { id: "descending", level: 0, bridge: "{ ...before[0], ordering: 'descending', modifiers: append(['ordering'], before[0].modifiers) }" },

    { id: "product", level: 0, bridge: "{ ...next(operator) }" },
    { id: "listAction", level: 0, bridge: "{ ...next(operator), what: after[0]}" },

    { id: "on", level: 0, bridge: "{ ...next(operator), report: after[0] }" },
    { id: "reportAction", level: 0, bridge: "{ ...next(operator), report: after[0].report }" },

    { id: "that", level: 0, bridge: "{ ...*, constraint: context }" },
    { id: "cost", level: 0, bridge: "{ ...next(operator), price: after[0] }" },
    { id: "cost", level: 1, bridge: "{ ...squish(operator), thing*: before[0] }" },
    { id: "property", level: 0, bridge: "{ ...next(operator) }" },
    { id: "price", level: 0,
        isA: ['number', 'property'],
        bridge: "{ ...next(operator) }" },
    { id: "quantity", level: 0, 
        isA: ['number', 'property'],
        bridge: "{ ...next(operator) }" },

    { id: "listingType", level: 0, bridge: "{ ...next(operator) }" },
    { id: "with", level: 0, bridge: "{ ...next(operator), type: after[0].value }" },
    { id: "answer", level: 0, bridge: "{ ...next(operator), type: after[0].type }" },

    { id: "show", level: 0, 
            bridge: "{ ...next(operator), on: { 'marker': 'report', types: ['report'], pullFromContext: true }, properties: after[0] }",
            "reportBridge": "{ ...next(operator), report: after[0] }" 
    },

    {
      id: "describe",
      level: 0,
      // isA: ['verby'],
      bridge: "{ ...next(operator), report: after[0] }",
      "generatorp": ({g, context}) => `describe ${g(context.report)}`,
      "generatorr": ({gp, context, apis, objects, config}) => {
                    const reports = propertyToArray(context.report)
                    let response = ''
                    for (let report of reports) {
                      if (report.number == 'many') {
                        for (let reportId in objects.listings) {
                          if (reportId.startsWith('tempReport')) {
                            continue
                          }
                          const description = {describe: true, word: reportId, types:["report"], value: reportId, text: reportId, marker: "report"}
                          response += `${reportId}: ${gp(description)}\n`
                        }
                      } else {
                        // response += `${gp(report)}: ${describe(report.value)}\n`
                        response += `${gp(report)}: ${gp({ ...report, describe: true })}\n`
                      }
                    }
                    return response
                  },
      semantic: ({context}) => {
        context.response = true
      }
    },

    { 
      id: "call", 
      level: 0, 
      bridge: "{ ...next(operator), namee: after[0], name: after[1] }",
      generatorp: ({g, context}) => `call ${g(context.namee)} ${g(context.name)}`,
      semantic: ({g, context, objects, e, config, km}) => {
        const namee = e(context.namee)
        const listing = objects.listings[namee.value]
        const name = context.name.text
        objects.listings[name] = {...listing}
        config.addWord(` ${name}`,  { id: 'report', initial: `{ value: "${name}" }` })
        km('dialogues').api.mentioned({
                  marker: "report",
                  text: name,
                  types: [ "report" ],
                  value: namee.value,
                  word: name
               })
      }
    },
  ],
  hierarchy: [
    ['ascending', 'ordering'],
    ['descending', 'ordering'],
    ['property', 'theAble'],
    ['column', 'toAble'],
    ['it', 'report'],
    ['describe', 'verby'],
  //  ['report', 'product'],
  ],
  associations: {
  },
  floaters: ["api", "isQuery"],
  debug: true,
  "version": '3',
  "words": {
    "tables": [{"id": "listingType", "initial": "{ value: 'tables' }" }],
    "sentences": [{"id": "listingType", "initial": "{ value: 'sentences' }" }],
    //"product1": [{"id": "reportObject", "initial": "{ value: 'api1' }" }],
    //"api2": [{"id": "reportObject", "initial": "{ value: 'api2' }" }],
    //" ([0-9]+)": [{"id": "amount", "initial": "{ value: int(group[0]) }" }],
  },

  priorities: [
    [['the', 0], ['ordering', 0]],
    [['listAction', 0], ['cost', 1]],
    [['answer', 0], ['listAction', 0], ['the', 0]],
    [['answer', 0], ['listAction', 0], ['the', 0], ['with', 0]],
  ],
  generators: [
    { 
      notes: 'paraphrase show',
      match: ({context, objects}) => context.marker == 'show' && context.paraphrase,
      apply: ({gs, gsp, gp, e, apis, objects, context}) => {
        if (context.report) {
          return `show ${gp(context.report)}`
        } else {
          const report = e(context.on)
          const listing = objects.listings[report.value]
          return `the properties being shown are ${gs(listing.columns, ', ', ' and ')}`
        }
      }
    },
    [ ({context}) => context.marker == 'reportAction' && context.response, ({context, g}) => `reporting on ${context.report.word}` ],
    [ ({context}) => context.marker == 'reportAction' && context.paraphrase, ({context, g}) => `report on ${context.report.word}` ],
    [ ({context}) => context.marker == 'product' && !context.isInstance, ({context}) => `the ${context.word}` ],
    [ ({context}) => context.marker == 'listAction' && context.paraphrase, ({g, context}) => `list ${g(context.what)}` ],
    { 
      notes: 'show the results as a sentence',
      match: ({context, objects, apis}) => {
        if (!(context.marker == 'listAction' && context.response)) {
          return false
        }
        if (objects.listings[context.id].type == 'sentences') {
          return true
        }
      },
      apply: ({g, gs, context}) => {
        gs(context.listing) 
        return `${g(context.what)} are ${gs(context.listing, ' ', ' and ')}` 
      }
    },
    { 
      notes: 'show the results as a table',
      match: ({context, objects, apis}) => {
        if (!(context.marker == 'listAction' && context.response && !context.paraphrase)) {
          return false
        }
        if (objects.listings[context.id].type == 'tables') {
          return true
        }
      }, 
      apply: ({g, gs, objects, context, apis}) => {
        let report = '';
        const products = context.listing
        const columns = objects.listings[context.id].columns
        // api.listing.api = context.what.api
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
    },
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
    { 
      notes: 'handle show semantic',
      match: ({context}) => context.marker == 'show',
      apply: ({context, e, km, apis, config, objects}) => {
        if (context.report) {
          const values = propertyToArray(context.report)
          const responses = []
          for (let value of values) {
            if (!value.value) {
              value = e(value)
            }
            // JSON.stringify(config.config.objects.namespaced.dialogues29.mentioned[0])
            const listing = objects.listings[value.value]
            const api = apis[listing.api]
            responses.push({
              marker: 'listAction', 
              // listing: config._api.apis[value.value.api].getAllProducts(api.listings[value.value.id]),
              listing: api.getAllProducts(listing),
              id: value.value,
              response: true,
            })
          }
          context.response = {
            marker: 'list', 
            newLinesOnly: true,
            value: responses,
          }
        } else {
          const report = e(context.on)
          const listing = objects.listings[report.value]
          const values = propertyToArray(context.properties)
          for (let value of values) {
            let column = value.marker
            if (value.marker == 'unknown') {
              column = value.value
            }
            if (!listing.columns.includes(column)) {
              listing.columns.push(column)
            }
            listing.ordering.push([value.marker, value.ordering])
            listing.columns = _.uniq(listing.columns)
          }
        }
      }
    },
    {
      notes: 'get the report data',
      match: ({context}) => context.marker == 'listAction', 
      apply: ({context, e, objects, apis, km, config}) => {
        //const name = '***current***'
        //km('dialogues').api.mentioned({ marker: "report", text: name, types: [ "report" ], value: name, word: name })
        if (context.api) {
          // id = newReport({km, objects})
          const report = e({ marker: 'report', pullFromContext: true })
          const id = report.value
          const listing = objects.listings[id]
          listing.api = context.api
          // TODO change this to context.data
          context.id = id
          context.listing = apis[listing.api].getAllProducts(listing)
        } else {
          const report = e({ marker: 'report', pullFromContext: true })
          const listing = objects.listings[report.value]
          const api = apis[listing.api]
          context.listing = api.getAllProducts(listing)
          context.id = report.value
          /*
          ask([
                {
                  // matchq: ({objects}) => !objects.winningScore,
                  applyq: ({gs, apis}) => `which product: ${gs(Object.keys(apis), ' ', ' and ')}?`,
                  matchr: ({context, isA}) => isA(context, 'product'),
                  applyr: ({context}) => {
                            const api = apis[context.marker]
                            responseContext.listing = config._api.apis[config._api.current].getAllProducts(api.listing)
                            context.response = responseContext
                          }
                }
             ])
           */
        }
        context.response = true
      },
    },
    [
      ({context}) => context.marker == 'answer', 
      ({e, context, objects}) => {
        const report = e({ marker: 'report', pullFromContext: true })
        const listing = objects.listings[report.value]
        listing.type = context.type
      }
    ],
  ],
};

const initializeApi = (config, api, km) => {
  const type = api.getName();
  config.addWord(type, {"id": "product", "initial": "{ greg: true, value: '" + type + `', api: '${type}'}` })
  /*
  api.listing = { 
    api: type,
    type: 'tables',
    columns: ['name', 'supplier'],
    ordering: [],
  }
  */
  // newReport(config, api)
  config.addGenerator( ...api.productGenerator )
  // const open = '{'
  // const close = '}'
  // config.addWord(type, {"id": "report", "initial": `${open} value: '${type}' ${close}` })
 }

config = new entodicton.Config(config, module).add(currencyKM).add(helpKM).add(math)
config.multiApi = initializeApi
// mode this to non-module init only
config.addAPI(api1)
config.addAPI(api2)
config.initializer(({config, objects, km, isModule, isAfterApi}) => {
  if (isAfterApi) {
    objects.listings = {
    }
    const id = newReport({km, objects})
    if (!isModule) {
      objects.listings[id].api = 'clothes'
    }
  }
}, { initAfterApi: true })
entodicton.knowledgeModule({
  module,
  description: 'this module is for getting info about a concept with properties',
  config,
  test: {
    name: './reports.test.json',
    contents: reports_tests
  },
})
