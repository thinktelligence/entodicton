const entodicton = require('entodicton')
const animals = require('./common/animals');
const avatar = require('./common/avatar');
const characters = require('./common/characters');
const currency = require('./common/currency');
const dialogues = require('./common/dialogues');
const help = require('./common/help');
const hierarchy = require('./common/hierarchy');
const javascript = require('./common/javascript');
const numbers = require('./common/numbers');
const people = require('./common/people');
const properties = require('./common/properties');
const reports = require('./common/reports');
const scorekeeper = require('./common/scorekeeper');
const tell = require('./common/tell');
const time = require('./common/time');

module.exports = { 
  Config: entodicton.Config,
  animals,
  avatar,
  characters,
  currency,
  dialogues,
  help,
  hierarchy,
  javascript,
  numbers,
  properties,
  reports,
  people,
  scorekeeper,
  tell,
  time,
}
