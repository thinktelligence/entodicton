const { reports } = require('ekms')

const testData = {
  types: [ 'tanks', 'planes' ],
  products: [
    { marker: 'product', isInstance: true, type: 'tanks', name: 'Tamiya Tiger', cost: 9, id: 1 },
    { marker: 'product', isInstance: true, type: 'planes', name: 'Meng P-47', cost: 15, id: 2 },
  ]
}

const interface = {
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
};

reports.interface = interface

reports.process('list the products').then( (response) => {
  for (r of response.generated[0]) {
    console.log(r)
  }
})
