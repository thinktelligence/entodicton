const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const tester_tests = require('./tester.test.json')
const ArgumentParser = require('argparse').ArgumentParser

const parser = new ArgumentParser({
  description: 'Test modules together'
})

parser.add_argument('-m', '--modules', { help: 'List of modules to load' })
const [args, unknown] = parser.parse_known_args()

process.argv = [process.argv[0], process.argv[1], ...unknown]

config = new Config({ name: 'tester' })
global.theprogrammablemind = {
  loadForTesting: {}
}
for (let module of args.modules.split(',')) {
  global.theprogrammablemind.loadForTesting[module] = true
  const km = require(`./${module}`)
  // km.rebuild({ isModule: false }) // load the usually defaults
  config.add(km)
}

knowledgeModule({
  module,
  description: 'Testing modules loaded together',
  config,
  test: {
    name: './tester.test.json',
    contents: tester_tests
  },
})
