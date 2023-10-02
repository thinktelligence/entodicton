const tpm = require('./common/runtime').theprogrammablemind
const animals = require('./common/animals');
const avatar = require('./common/avatar');
const characters = require('./common/characters');
const crew = require('./common/crew');
const currency = require('./common/currency');
const dialogues = require('./common/dialogues');
const help = require('./common/help');
const hierarchy = require('./common/hierarchy');
const javascript = require('./common/javascript');
const kirk = require('./common/kirk');
const meta = require('./common/meta');
const numbers = require('./common/numbers');
const people = require('./common/people');
const ordering = require('./common/ordering');
const properties = require('./common/properties');
const reports = require('./common/reports');
const scorekeeper = require('./common/scorekeeper');
const spock = require('./common/spock');
const stgame = require('./common/stgame');
const tell = require('./common/tell');
const time = require('./common/time');

module.exports = { 
  Config: tpm.Config,
  animals,
  avatar,
  characters,
  crew,
  currency,
  dialogues,
  help,
  hierarchy,
  javascript,
  kirk,
  meta,
  numbers,
  ordering,
  properties,
  reports,
  people,
  scorekeeper,
  spock,
  stgame,
  tell,
  time,
}
