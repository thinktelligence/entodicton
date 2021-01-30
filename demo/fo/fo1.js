const client = require('entodicton/client')
const Config = require('entodicton/src/config')

const objects = {
  "fallout": {
    "merchant": {
      "guns": [
        { "marker": "gun", "name": "combat shotgun", "types": ["shotgun"], "damage": { "per shot": 55, "per second": 82.5 }, "value": 200 },
        { "marker": "gun", "name": "the terrible shotgun", "types": ["shotgun"], "damage": { "per shot": 80, "per second": 120 }, "value": 250 },
        { "marker": "gun", "name": "10mm SMG", "types": ["smg"], "damage": { "per shot": 7, "per second": 70 }, "value": 66 }
      ]
    }
  }
}

let config = {
  debug: true,
  operators: [
    '([listGuns|show] ([userConcept|me]) (<the> ([gunConcept])))'
  ],
  bridges: [
    { "id": "gunConcept", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "userConcept", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "listGuns", "level": 0, "bridge": "{ ...operator, who: after[0], gunType: after[1].type }" },
    { "id": "the", "level": 0, "bridge": "{ ...after, pullFromContext: true }" },
  ],
  priorities: [
  ],
  "version": '3',
  "words": {
    "shotguns": [{"id": "gunConcept", 'initial': { 'type': 'shotgun' } }]
  },

  generators: [
    [ ({context}) => context.marker == 'listGuns' && !context.hasAnswer, ({g, context}) => `list the guns of type ${g(context.gunType)}` ],
    [ ({context}) => context.marker == 'listGuns' && context.hasAnswer, ({gs, context}) => `I have ${gs(context.guns, ', ', ' and ')}` ],
    [ ({context}) => context.marker == 'gun', ({g, context}) => `${context.name} for ${context.value} caps` ],
  ],

  semantics: [
    [({global, context}) => context.marker == 'listGuns', ({global, context}) => {
      console.log('global', global)
      context.guns = global.fallout.merchant.guns.filter( (gun) => gun.types.includes(context.gunType) )
      context.hasAnswer = true
     }],
  ],
};

url = "http://Deplo-Entod-1FYMS71PIEWAI-2094328980.ca-central-1.elb.amazonaws.com"
key = "d83579b0-ffda-444d-9942-ac8fa2856f5c"

const query = 'show me the shotguns'
console.log(`Running the input: ${query}`);
config.utterances = [query]
config.objects = objects
config = new Config(config)
client.process(url, key, config)
  .then( (responses) => {
    if (responses.errors) {
      console.log('Errors')
      responses.errors.forEach( (error) => console.log(`    ${error}`) )
    }
    console.log('This is the global objects from running semantics:\n', config.objects)
    if (responses.logs) {
      console.log('Logs')
      responses.logs.forEach( (log) => console.log(`    ${log}`) )
    }
    console.log(responses.trace)
    console.log(responses.generated);
    console.log(JSON.stringify(responses.results, null, 2));
  })
  .catch( (error) => {
    console.log(`Error ${query}`);
    console.log(error)
  })
