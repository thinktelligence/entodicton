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
for (let module of args.modules.split(',')) {
  config.add(require(`./${module}`))
}

debugger
knowledgeModule({
  module,
  description: 'Testing modules loaded together',
  config,
  test: {
    name: './tester.test.json',
    contents: tester_tests
  },
})
