const entodicton = require('entodicton')
const hierarchy = require('./hierarchy')
const barak_tests = require('./barak.test.json')
const barak_instance = require('./barak.instance.json')

const template ={
  "queries": [
    "political modifies parties",
    "republicans are a political party",
    "democrats are a political party",
    "barak modifies obama",
    "barak obama is a democrat",
  ],
}

// two bugs: hierarchy has barak_obama isA obama
//           negative associations are missing
const config = new entodicton.Config({ 
  name: 'barak',
  words: {
    "barak": [{id: "barak_obama", pseudo: true, initial: "{}" }],
  },
  /*
  associations: {
    negative: [
      [['barak_obama', 0], ['obama', 0]],
      [['barak_obama', 0], ['barak', 0]],
    ],
    positive: [
      [['barak', 0], ['obama', 0]],
    ]
  },
  */

}, module)
config.add(hierarchy)

entodicton.knowledgeModule( {
    module,
      description: 'barak related concepts',
      config,
      test: {
              name: './barak.test.json',
              contents: barak_tests
            },
      template: {
        template,
        instance: barak_instance
      }
})
