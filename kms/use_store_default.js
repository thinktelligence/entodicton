const { store } = require('ekms')

url = "http://184.67.27.82"
key = "6804954f-e56d-471f-bbb8-08e3c54d9321"
store.server(url, key)
store.process('answer with sentences list the products').then( (response) => {
  //console.log(JSON.stringify(response, null, 2))
  for (r of response.generated[0]) {
    console.log(r)
  }
})
