const { store } = require('ekms')

const testData1 = {
  types: [ 'tanks', 'planes' ],
  products: [
    { marker: 'product', isInstance: true, type: 'tanks', name: 'Tamiya Tiger', cost: 9, id: 1 },
    { marker: 'product', isInstance: true, type: 'planes', name: 'Meng P-47', cost: 15, id: 2 },
  ]
}

const testData2 = {
  types: [ 'tea', 'coffee' ],
  products: [
    { marker: 'product', isInstance: true, type: 'tea', name: 'Earl Gray', cost: 9, id: 1 },
    { marker: 'product', isInstance: true, type: 'coffee', name: 'The Mexican', cost: 15, id: 2 },
  ]
}

const interface = (testData) => { return {
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
} };

const store1 = store.copy()
store1.interface = interface(testData1)
url = "http://184.67.27.82"
key = "6804954f-e56d-471f-bbb8-08e3c54d9321"
store.server(url, key)
store.process('list the planes').then( (response) => {
  //console.log(JSON.stringify(response, null, 2))
  console.log(response.generated[0])
})
