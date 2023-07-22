const { Config, knowledgeModule, where } = require('entodicton')
const currencyKM = require('./currency.js')
const events = require('./events.js')
const math = require('./math.js')
const helpKM = require('./help.js')
const { propertyToArray, wordNumber, toEValue } = require('./helpers')
const { table } = require('table')
const _ = require('lodash')
const reports_tests = require('./reports.test.json')
const reports_instance = require('./reports.instance.json')
const { v4 : uuidv4, validate : validatev4 } = require('uuid');

const template ={
  "queries": [
      "worth means price times quantity"
  ],
}

/*
  show supplier on report1
  show supplier (on current report)

  NEXT reportAction on report where remove/move etc are reportActions
  delete means remove remove column 2 show it
  show the worth
*/

/* START USER DEFINED: this part could be calling your backend db */

const compareValue = (property, v1, v2) => {
  return v1[property] < v2[property] ? -1 :
         v1[property] > v2[property] ? 1 :
         0;
}

const newReport = ({km, objects}) => {
  objects.tempReportId += 1
  const reportId = `tempReport${objects.tempReportId}`
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
  return [...list].sort(compareObject(ordering))
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
    "([reportAction|] ([on] ([report|])))",
    "(([product]) <(<that> ([cost] ([price])))>)",
    "([answer] ([with] ([listingType|])))",
    "([show] (<the> ([property])))",
    "([call] ([report|]) (rest))",
    "(([property]) <ascending>)",
    "(([property]) <descending>)",
    "([describe] ([report]))",
    "([price])",
    "([quantity])",
    "([ordering])",
    "([show:reportBridge] ([report]))",
    "([column] ([number]))",
    "([move] ([column]) ([to] ([column])))",
    "([move:directionBridge] ([column]) ([direction]))",
    "([left])",
    "([right])",
    "([remove] ([column]))",
    /*
       call this the banana report
       show the banana report
       price descending
       price ascending
    */
    // DONE show price and quantity
    // DONE describe report1
    // DONE after the report changes show it
    // DONE after changing a report show it -> event IDEA OF EVENT
    // after changing report 1
    // after changing the columns
    // after move show the report -> marker
    // -> multi word report names
    // call this report a  show report a show report a for products that code more than 10 dollars
    // DONE show the models
    // save this as report1 / show report1
    // list the products with the price descending
    // call this report report1
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
    // show the price times quantity call it worth
    // call the columns fred's amount

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
        directionBridge: "{ ...next(operator), on: { marker: 'report', pullFromContext: true }, directionBridge: true, from: after[0], to: after[1] }",

        generatorp: ({context, gp}) => `move ${gp(context.from)} ${gp(context.to)}`,
        semantic: ({context, e, objects, kms}) => {
          const report = e(context.on)
          const id = report.value.value
          const listing = objects.listings[id]

          const from = context.from.index.value;
          let to;
          if (context.directionBridge) {
            if (context.to.marker == 'left') {
              to = from - 1
            }
            if (context.to.marker == 'right') {
              to = from + 1
            }
          } else {
            to = context.to.object.index.value;
          }
          const old = listing.columns[from-1]
          listing.columns[from-1] = listing.columns[to-1]
          listing.columns[to-1] = old
          kms.events.api.happens({ marker: "changes", changeable: report })
        }
    },
    { id: "remove", level: 0, 
        bridge: "{ ...next(operator), on: { marker: 'report', pullFromContext: true }, removee: after[0] }",
        generatorp: ({context, gp}) => `remove ${gp(context.removee)}`,
        semantic: ({context, e, objects}) => {
          const report = e(context.on)
          const id = report.value.value
          const listing = objects.listings[id]
          const column = context.removee.index.value
          listing.columns.splice(column-1, 1)
        }
    },
    { id: "column", level: 0, 
        bridge: "{ ...next(operator), index: after[0] }",
        generatorp: ({context, gp}) => `column ${gp(context.index)}`,
    },
    { id: "ordering", level: 0, bridge: "{ ...next(operator) }" },
    { id: "direction", level: 0, bridge: "{ ...next(operator) }" },
    { id: "left", isA: ['direction'], level: 0, bridge: "{ ...next(operator) }" },
    { id: "right", isA: ['direction'], level: 0, bridge: "{ ...next(operator) }" },
    { id: "report", level: 0, 
            isA: ['theAble'], 
            words: [{word: "reports", number: "many"}], 
            bridge: "{ ...next(operator) }",
            generators: [
              {
                where: where(),
                match: ({context}) => context.marker == 'report' && context.describe,
                apply: ({context, apis, gp, gs, objects}) => {
                  const listings = objects.listings[context.value]
                  // {"type":"tables","columns":["name"],"ordering":[]}
                  return `for ${listings.api}, showing the ${wordNumber('property', listings.columns.length > 1)} ${gs(listings.columns, ' ', ' and ')} as ${listings.type}`
                }
              },
              {
                where: where(),
                match: ({context}) => context.marker == 'report' && context.evalue,
                apply: ({context}) => context.evalue.value
              }
            ],
    },

    { id: "ascending", level: 0, bridge: "{ ...before[0], ordering: 'ascending' }" },
    { id: "descending", level: 0, bridge: "{ ...before[0], ordering: 'descending', modifiers: append(['ordering'], before[0].modifiers) }" },

    { id: "product", level: 0, bridge: "{ ...next(operator) }" },
    { id: "listAction", level: 0, bridge: "{ ...next(operator), what: after[0]}" },

    { id: "on", level: 0, bridge: "{ ...next(operator), report: after[0] }" },
    { id: "reportAction", level: 0, bridge: "{ ...next(operator), on: after[0].report }" },

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
            reportBridge: "{ ...next(operator), report: after[0] }" 
    },

    {
      id: "describe",
      level: 0,
      isA: ['verby'],
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
        context.isResponse = true
      }
    },

    { 
      id: "call", 
      level: 0, 
      bridge: "{ ...next(operator), namee: after[0], name: after[1] }",
      generatorp: ({g, context}) => `call ${g(context.namee)} ${g(context.name)}`,
      semantic: ({g, context, objects, e, config, km}) => {
        const namee = e(context.namee)
        const id = namee.value.value
        const listing = objects.listings[id]
        const name = context.name.text
        objects.listings[name] = {...listing}
        config.addWord(` ${name}`,  { id: 'report', initial: `{ value: "${name}" }` })
        km('dialogues').api.mentioned({
                  marker: "report",
                  text: name,
                  types: [ "report" ],
                  value: id,
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
    ['report', 'it'],
    ['report', 'this'],
    ['describe', 'verby'],
    ['call', 'verby'],
    ['show', 'verby'],
    ['report', 'changeable'],
    ['show', 'action'],
    ['move', 'reportAction'],
    ['remove', 'reportAction'],
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
    [['articlePOS', 0], ['ordering', 0]],
  /*
    [['the', 0], ['ordering', 0]],
    [['listAction', 0], ['cost', 1]],
    [['answer', 0], ['listAction', 0], ['the', 0]],
    [['answer', 0], ['listAction', 0], ['the', 0], ['with', 0]],
  */
  ],
  generators: [
    { 
      notes: 'paraphrase show',
      where: where(),
      match: ({context, objects}) => context.marker == 'show' && context.paraphrase,
      apply: ({gs, gsp, gp, e, apis, objects, context}) => {
        if (context.report) {
          return `show ${gp(context.report)}`
        } else {
          const report = e(context.on)
          const id = report.value.value
          const listing = objects.listings[id]
          return `the properties being shown are ${gs(listing.columns, ', ', ' and ')}`
        }
      }
    },
    { 
      where: where(),
      match: ({context, isA}) => isA(context.marker, 'reportAction') && context.on && context.isResponse, 
      apply: ({context, g}) => `${g({...context, on: undefined})} on ${g(context.on)}` 
    },
    { 
      where: where(),
      match: ({context, isA}) => isA(context.marker, 'reportAction') && context.on && context.paraphrase, 
      apply: ({context, g}) => `${g({...context, on: undefined})} on ${g(context.on)}` 
    },
    { 
      where: where(),
      match: ({context}) => context.marker == 'product' && !context.isInstance, 
      apply: ({context}) => `the ${context.word}` 
    },
    { 
      where: where(),
      match: ({context}) => context.marker == 'listAction' && context.paraphrase, 
      apply: ({g, context}) => `list ${g(context.what)}` 
    },
    { 
      notes: 'show the results as a sentence',
      where: where(),
      match: ({context, objects, apis}) => {
        if (!(context.marker == 'listAction' && context.isResponse)) {
          return false
        }
        if (objects.listings[context.id].type == 'sentences') {
          return true
        }
      },
      apply: ({g, gs, context, objects}) => {
        const listing = objects.listings[context.id]
        return `the ${g(listing.api)} are ${gs(context.listing, ' ', ' and ')}` 
      }
    },
    { 
      notes: 'show the results as a table',
      where: where(),
      match: ({context, objects, apis}) => {
        if (!(context.marker == 'listAction' && context.isResponse && !context.paraphrase)) {
          return false
        }
        if (objects.listings[context.id].type == 'tables') {
          return true
        }
      }, 
      apply: ({g, gs, objects, context, e, kms, apis}) => {
        let report = '';
        const products = context.listing
        const columns = objects.listings[context.id].columns
        if (false) {
          debugger;
          kms.dialogues.api.setVariable('price', { marker: 'price', value: 23 })
          kms.dialogues.api.setVariable('quantity', { marker: 'quantity', value: 3 })
          const c1 = { marker: 'worth', value: 'worth' }
          r1 = toEValue(e(c1));
          r2 = e({ marker: 'supplier', value: 'supplier' })
          // api.listing.api = context.what.api
        }
        const data = products.map( (product) => {
          const row = []
          for (let p of Object.keys(product)) {
            kms.dialogues.api.setVariable(p, { marker: p, value: product[p] })
          }
          for (let property of columns) {
            const value = toEValue(e({ marker: property, value: property }));
            row.push(value)
          }
          return row
        });
        report += table([columns].concat(data))
        return report
      }
    },
    { 
      where: where(),
      match: ({context}) => context.marker == 'answer' && context.paraphrase, 
      apply: ({g, context}) => `answer with ${context.type}` 
    },
    { 
      where: where(),
      match: ({context}) => context.marker == 'answer' && !context.paraphrase, 
      apply: ({g, context}) => `answering with ${context.type}` 
    },
  ],

  semantics: [
    { 
      where: where(),
      notes: 'handle show semantic',
      match: ({context}) => context.marker == 'show',
      apply: ({context, e, km, kms, apis, config, objects}) => {
        if (context.report) {
          const values = propertyToArray(context.report)
          const responses = []
          for (let value of values) {
            if (!value.value || value.pullFromContext) {
              value = e(value)
            }
            // JSON.stringify(config.config.objects.namespaced.dialogues29.mentioned[0])
            let id = value.value
            if (value.evalue) {
              id = value.evalue.value
            }
            const listing = objects.listings[id]
            const api = apis[listing.api]
            responses.push({
              marker: 'listAction', 
              // listing: config._api.apis[value.value.api].getAllProducts(api.listings[value.value.id]),
              listing: api.getAllProducts(listing),
              id,
              isResponse: true,
            })
          }
          context.evalue = {
            marker: 'list', 
            newLinesOnly: true,
            value: responses,
          }
          context.isResponse = true
        } else {
          const report = e(context.on)
          const id = report.value.value
          const listing = objects.listings[id]
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
      where: where(),
      match: ({context}) => context.marker == 'listAction', 
      apply: ({context, e, objects, apis, km, config}) => {
        //const name = '***current***'
        //km('dialogues').api.mentioned({ marker: "report", text: name, types: [ "report" ], value: name, word: name })
        if (context.api) {
          // id = newReport({km, objects})
          const report = e({ marker: 'report', pullFromContext: true })
          const id = report.value.value
          const listing = objects.listings[id]
          listing.api = context.api
          // TODO change this to context.data
          context.id = id
          context.listing = apis[listing.api].getAllProducts(listing)
        } else {
          const report = e({ marker: 'report', pullFromContext: true })
          const id = report.evalue.value
          const listing = objects.listings[id]
          const api = apis[listing.api]
          context.listing = api.getAllProducts(listing)
          context.id = id
        }
        context.isResponse = true
      },
    },
    [
      ({context}) => context.marker == 'answer', 
      ({e, context, objects, kms}) => {
        const report = e({ marker: 'report', pullFromContext: true })
        const id = report.value.value
        const listing = objects.listings[id]
        listing.type = context.type
        kms.events.api.happens({ marker: "changes", changeable: { marker: 'report', pullFromContext: true } })
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

config = new Config(config, module).add(currencyKM).add(helpKM).add(math).add(events)
config.multiApi = initializeApi
// mode this to non-module init only
config.addAPI(api1)
config.addAPI(api2)
config.initializer(({config, objects, km, isModule, isAfterApi}) => {
  if (isAfterApi) {
    objects.tempReportId = 0
    objects.listings = {
    }
    const id = newReport({km, objects})
    if (!isModule) {
      objects.listings[id].api = 'clothes'
    }
  }
}, { initAfterApi: true })
knowledgeModule({
  module,
  description: 'this module is for getting info about a concept with properties',
  config,
  test: {
    name: './reports.test.json',
    contents: reports_tests
  },
  template: {
    template,
    instance: reports_instance
  },
})
