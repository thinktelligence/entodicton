const { reports } = require('ekms')

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

debugger
// reports.interface = apiTemplate('models', testData2)
reports.addAPI(apiTemplate('models', testData))

reports.process('list the models').then( (response) => {
  for (r of response.generated) {
    console.log(r)
  }
}).catch( (e) => {
  console.log('Well that escalated quickly', e)
});
