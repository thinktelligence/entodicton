const _ = require('lodash')
const client = require('entodicton/client')
const Config = require('entodicton/src/config')
const fs = require('fs');
const fetch = require('node-fetch')
const base64 = require('base-64')

/***************************************************************************************************************/
/*                                                                                                             */
/* How to submit a bug                                                                                         */
/*                                                                                                             */
/* 1. Put your config in a single file.                                                                        */
/*                                                                                                             */
/* 2. Add two new properties, expected_results and expected_generated. The value of these                      */
/*    are what you expect the results to be.                                                                   */
/*                                                                                                             */
/* 3. Run bug.js against your deployment with your config.                                                     */
/*                                                                                                             */
/* 4. If the bug is submitted you will see "Bug Submitted". If not your config was not runnable.               */
/*    Fix it and try again.                                                                                    */
/*                                                                                                             */
/* 5. Bug management can be performed on the "Subscription" page of thinktelligence.com                        */
/*                                                                                                             */
/***************************************************************************************************************/

const usage = () => {
  print('node ./bug.js <subscription_id> <password> <entodiction server> <entodiction port> <entodicton key> <config> <description>')
}

const subscription_id = process.argv[2]
const password = process.argv[3]
const server = process.argv[4]
const port = process.argv[5]
const key = process.argv[6]
const config = process.argv[7]
const description = process.argv[8]
let submit = true;
if (process.argv[9] == 'false') {
  console.log('********************** submit is false *************************8')
  submit = false;
}

const URL = `http://${server}:${port}`

const matching = (actual, expected) => {
  if (!_.isEqual(actual, expected)) {
    return false;
  }
  return true;
}

const config_bug = require(config);

const submitBug = () => {
  console.log("********* Submitting bug *********")
  configFile = fs.readFileSync(config, 'UTF8')
  const body = { description, config: configFile };
  fetch(`${URL}/bug`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      mode: "no-cors", // Type of mode of the request
      "Content-Type": "application/json", // request content type
      "Authorization": 'Basic ' + base64.encode(subscription_id + ":" + password)
    },
    }).then( async (result) => {
      json = await result.json()
      if (json.error) {
        console.log(`Error submitting the bug: ${json.error}`);
      } else {
        console.log(`New bug id id ${json.id}`);
      }
    });
}

expected_results = config_bug.expected_results
expected_generated = config_bug.expected_generated

client.process(new Config(config_bug), key, server, port)
  .then( (responses) => {
    if (!matching(responses.results, expected_results)) {
      console.log('JSON does not match');
      console.log('actual', JSON.stringify(responses.results))
      console.log('expected', JSON.stringify(expected_results))
      if (submit) {
        submitBug()
      } else {
        process.exit(-1)
      }
    }
    if (!matching(responses.generated, expected_generated)) {
      console.log('Generated does not match');
      console.log('actual', JSON.stringify(responses.generated))
      console.log('expected', JSON.stringify(expected_generated))
      console.log('submit', submit)
      if (submit) {
        submitBug()
      } else {
        process.exit(-1)
      }
    }
  })
  .catch( (error) => { 
    console.log('Error', error)
  })
