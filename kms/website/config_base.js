// This file contains all the config for the natural language interface

module.exports = 
{
  "operators": [
    "(([query|what]) [([equal|is] (([number]) <plus> ([number])))])",
    "(([query|what]) [([equal|is] ([position]))])",
    "(([query|what]) [([equal|is] (<the|the> ([propertyConcept])))])",
    "(([query|quelle,quel]) [([equal|est] (<la|la> ([propertyConcept])))])",
    "((<la> ([propertyConcept])) [([property|de] ([tankConcept]))])",
    "((<the> ([propertyConcept])) [([property|of] ([tankConcept]))])",
    "([move] (([tankConcept|tank]) [([to] ([buildingConcept|building]))]))",
    "([move] (([tankConcept|tank]) [([to] ([tankConcept|tank]))]))",
    "([move] ((<all> ([tankConcept|tank])) [([to] ([tankConcept|tank]))]))",
    "([move] ((<all> (<the> ([tankConcept|tank]))) [([to] ([tankConcept|tank]))]))",
    "(([tankConcept]) [(([tankConcept]) [conj|and] ([tankConcept]))])",
    "([stop] ([tankConcept|tank]))",
    "([stop] (<all> (<the> ([tankConcept|tank]))) )",
    "([create] (<aEnglish> ([tankConcept|tank])))",
    "([create] (<aEnglish> ([buildingConcept])))",
    "([create] (<count> ([tankConcept])))",
    "([destroy] ([tankConcept|tank]))",
    "([destroy] (<all> (<the> ([tankConcept]))))",
    "([destroy] (<all> (<the> ([buildingConcept]))))",
    "([call] ([nameableConcept|]) ([name]))",
    "([appellez] ([nameableConcept|]) ([name]))",
    "([deplacez] ([tankConcept|char]) ([vers] batiment))",
    "([bougez] (([tankConcept]) [([aFrench] ([buildingConcept]))]))",
    "(([tankConcept|char]) [conj|et] ([tankConcept]))",
    "([arreter] ([tankConcept|char]))",
    "([detruire] ([tankConcept|char]))",
    "([position])",
    "([english])",
    "([french])",
    "([anyConcept])",
  ],
  "bridges": [
    {"id": "english", "level": 0, "bridge": "{ ...after }", "uuid": "1"},
    {"id": "french", "level": 0, "bridge": "{ ...after }", "uuid": "1"},
    {"id": "name", "level": 0, "bridge": "{ ...after }", "uuid": "1"},
    {"id": "nameableConcept", "level": 0, "bridge": "{ ...after }", "uuid": "1"},
    {"id": "all", "level": 0, "bridge": "{ ...after[0], number: 'all' }", "uuid": "1"},
    {"id": "the", "level": 0, "bridge": "{ ...after[0], concept: true }", "uuid": "1"},
    {"id": "la", "level": 0, "bridge": "{ ...after[0], gender: 'f', concept: true }", "uuid": "1"},
    {"id": "query", "level": 0, "bridge": "{ marker: 'query', isQuery: true }", "uuid": "1"},
    {"id": "property", "level": 0, "bridge": "{ object: after[0], ...next(operator) }", "uuid": "1"},
    {"id": "property", "level": 1, "bridge": "{ value: objects.tanks[operator.object['id']][before[0].name], marker: operator(objects.types[before[0].name].id, objects.types[before[0].name].level), propertyName: before[0].name, object:operator.object.id, isProperty: true }", "uuid": "1"},
    {"id": "equal", "level": 0, "bridge": "{ objects: after[0], ...next(operator) }", "uuid": "1"},
    {"id": "equal", "level": 1, "bridge": "{ ...next(operator), objects: append(before, [operator.objects]) }", "uuid": "1"},
    {"id": "plus", "level": 0, "selector": {"match": "same", "left": [{"marker": "number"}], "right": [{"marker": "number"}], "passthrough": true}, "bridge": "{ ...next(operator), value: add(before, after), marker: before[0].marker }", "uuid": "1"},
    {"id": "conj", "level": 0, "selector": {"match": "same", "left": [{"sentinals": ["number"], "variable": "v", "no_match": ["nameableConcept", "anyConcept"]}], "right": [{"sentinals": ["number"], "variable": "v"}], "passthrough": true}, "bridge": "{ ...next(operator), value: append(before, after) }", "uuid": "1"},
    {"id": "conj", "level": 1, "selector": {"match": "same", "left": [{"sentinals": ["number"], "variable": "v"}], "passthrough": true}, "bridge": "{ ...operator, value: append(before, operator.value) }", "uuid": "1"},
    {"id": "propertyConcept", "level": 0, "bridge": "{ ...next(operator) }", "uuid": "1"},
    {"id": "tankConcept", "level": 0, "bridge": "{ ...next(operator) }", "uuid": "1"},
    {"id": "buildingConcept", "level": 0, "bridge": "{ ...next(operator) }", "uuid": "1"},
    {"id": "to", "level": 0, "bridge": "{ ...next(operator), destination: after[0] }", "uuid": "1"},
    {"id": "to", "level": 1, "bridge": "{ ...next(operator), thing: before[0] }", "uuid": "1"},
    {"id": "move", "level": 0, "bridge": "{ ...after[0], ...next(operator) }", "uuid": "1"},
    {"id": "move", "level": 1, "bridge": "{ action: 'move', marker: 'move', thing: operator.thing, place: operator.destination }", "uuid": "1"},
    {"id": "stop", "level": 0, "bridge": "{ thing: after[0], ...next(operator) }", "uuid": "1"},
    {"id": "stop", "level": 1, "bridge": "{ action: 'stop', marker: 'stop', thing: operator.thing }", "uuid": "1"},
    {"id": "position", "level": 0, "bridge": "{ ...next(operator), ...after }", "uuid": "1"},
    {"id": "number", "level": 0, "bridge": "{ ...next(operator), ...after }", "uuid": "1"},
    {"id": "count", "level": 0, "bridge": "{ ...operator, ...after[0], number: operator.value }", "uuid": "1"},
    {"id": "aEnglish", "level": 0, "selector": {"type": "prefix"}, "bridge": "{ ...after[0], number: 1 }", "uuid": "1"},
    {"id": "create", "level": 0, "selector": {"type": "prefix"}, "bridge": "{ klass: after[0], ...next(operator) }", "uuid": "1"},
    {"id": "create", "level": 1, "bridge": "{ action: 'create', marker: 'create', klass: operator.klass }", "uuid": "1"},
    {"id": "destroy", "level": 0, "bridge": "{ name: after[0], ...next(operator) }", "uuid": "1"},
    {"id": "destroy", "level": 1, "bridge": "{ action: 'destroy', marker: 'destroy', name: operator.name }", "uuid": "1"},
    {"id": "call", "level": 0, "bridge": "{ ...next(operator), thing: after[0], name: after[1] }", "uuid": "1"},
    {"id": "call", "level": 1, "bridge": "{ marker: 'alias', thing: operator.thing, name: operator.name }", "uuid": "1"},
    {"id": "vers", "level": 0, "bridge": "{ ...next(operator), after: after[0], language: 'french' }", "uuid": "1"},
    {"id": "aFrench", "level": 0, "bridge": "{ ...next(operator), destination: after[0] }", "uuid": "1"},
    {"id": "aFrench", "level": 1, "bridge": "{ ...next(operator), thing: before[0] }", "uuid": "1"},
    {"id": "deplacez", "level": 0, "bridge": "{ ...squish(after), thing: after[0], ...next(operator), language: 'french' }", "uuid": "1"},
    {"id": "deplacez", "level": 1, "bridge": "{ action: 'move', marker: 'move', thing: operator.thing, place: operator.vers }", "uuid": "1"},
    {"id": "bougez", "level": 0, "bridge": "{ place: after[0].destination, thing: after[0].thing, ...next(operator) }", "uuid": "1"},
    {"id": "bougez", "level": 1, "bridge": "{ action: 'move', marker: 'move', thing: operator.thing, place: operator.place }", "uuid": "1"},
    {"id": "appellez", "level": 0, "bridge": "{ ...next(operator), thing: after[0], name: after[1] }", "uuid": "1"},
    {"id": "appellez", "level": 1, "bridge": "{ marker: 'alias', thing: operator.thing, name: operator.name }", "uuid": "1"},
    {"id": "arreter", "level": 0, "bridge": "{ thing: after[0], ...next(operator) }", "uuid": "1"},
    {"id": "arreter", "level": 1, "bridge": "{ action: 'stop', marker: 'stop', thing: operator.thing }", "uuid": "1"},
    {"id": "detruire", "level": 0, "bridge": "{ name: after[0], ...next(operator) }", "uuid": "1"},
    {"id": "detruire", "level": 1, "bridge": "{ action: 'destroy', marker: 'destroy', name: operator.name }", "uuid": "1"},
    {"id": "anyConcept", "level": 0, "bridge": "{ ...next(operator) }", "uuid": "1"},
  ],
  "hierarchy": [
    ["tankConcept", "nameableConcept"],
    ["buildingConcept", "nameableConcept"],
    ["tankConcept", "anyConcept"],
    ["buildingConcept", "anyConcept"],
  ],
  "priorities": [
    [["equal", 0], ["the", 0], ["propertyConcept", 0], ["query", 0], ["property", 0], ["tankConcept", 0]],
    [["equal", 0], ["the", 0], ["property", 0], ["query", 0], ["propertyConcept", 0]],
    [["equal", 0], ["property", 0], ["query", 0]],
    [["equal", 0], ["property", 1]],
  ],
  "associations": {
    "negative": [],
    "positive": [],
  },
  "words": {
    "+": [{"id": "plus", "uuid": "1"}],
    " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }", "uuid": "1"}, {"id": "count", "initial": "{ value: int(group[0]) }", "uuid": "1"}],
    "plus": [{"id": "plus", "uuid": "1"}],
    "tanks": [{"id": "tankConcept", "initial": {"language": "english"}, "uuid": "1"}],
    "buildings": [{"id": "buildingConcept", "uuid": "1"}],
    " tank([0-9]+)": [{"id": "tankConcept", "initial": "{ id: concat('tank', group[0]), language: 'english' }", "uuid": "1"}],
    " char([0-9]+)": [{"id": "tankConcept", "initial": "{ id: concat('tank', group[0]), language: 'french' }", "uuid": "1"}],
    " building([0-9]+)": [{"id": "buildingConcept", "initial": "{ id: concat('building', group[0]), language: 'english' }", "uuid": "1"}],
    " batiment([0-9]+)": [{"id": "buildingConcept", "initial": "{ id: concat('building', group[0]), language: 'french' }", "uuid": "1"}],
    "a": [{"id": "aEnglish", "initial": {"language": "english"}, "uuid": "1"}],
    "et": [{"id": "conj", "initial": {"language": "english"}, "uuid": "1"}],
    "speed": [{"id": "propertyConcept", "initial": {"language": "english", "name": "velocity"}, "uuid": "1"}],
    "vitesse": [{"id": "propertyConcept", "initial": {"language": "french", "name": "velocity"}, "uuid": "1"}],
    "position": [{"id": "propertyConcept", "initial": {"language": "english", "name": "position"}, "uuid": "1"}],
    "tank1": [{"id": "tankConcept", "initial": {"id": "tank1"}, "uuid": "1"}],
    "it": [{"id": "anyConcept", "initial": {"language": "english", "pullFromContext": true}, "uuid": "1"}],
  },
  "floaters": [
    "language",
    "gender",
    "isQuery",
  ],
  "implicits": [
    "language",
  ],
  "flatten": [
    "conj",
  ],
  "utterances": [
    "what is the speed of tank1 and tank2",
    "what is 1 + 1 + 1 and 20 + 30",
    "move tank1 and tank2 to building2 and tank3 and tank4 to building3",
    "move tank1 to building1 deplacez char1 vers char2",
    "move tank1 to building2 tank2 to building1 and tank3 to building3",
    "create 4 tanks",
    "move all the tanks to building3",
    "move all tanks to building3",
    "move tank1 to tank2",
    "quel est 1 + 1",
    "what is 1 + 1",
    "quelle est la position de char1",
    "quelle est la vitesse de char1",
    "what is the position of tank1",
    "what is the speed of tank1",
    "deplacez char1 et char2 vers batiment1",
    "move tank1 and tank2 to building2",
    "create a tank",
    "create a building",
    "destroy tank1",
    "move tank1 to tank2",
    "move tank1 and tank2 to building1",
    "deplacez char1 vers char2",
    "move tank1 to building1",
    "deplacez char1 vers batiment1",
    "deplacez char1 vers batiment1 move tank1 to tank2",
    "call tank1 commander",
    "appellez char1 commandeur",
    "call building1 cia",
    "appellez batiment1 cia",
    "move commander to cia",
    "deplacez commandeur vers cia",
    "stop tank1",
    "arreter char1",
    "bougez char1 a batiment1",
    "destroy all the buildings",
    "stop all the tanks",
    "destroy all the tanks",
  ],
  "generators": [
    [({context}) => context.marker.endsWith('Concept') && context.number > 0, ({g, context}) => `${g(context.number)} ${g(context.word)}`],
    [({context}) => context.marker.endsWith('Concept') && !('number' in context), ({g, context}) => `${g(context.word)}`],
    [({context}) => context.marker.endsWith('Concept') && context.number == 'all', ({g, context}) => `all ${g(context.word)}`],
    [({context}) => context.marker == 'article' && context.gender == 'm', ({g, context}) => 'le'],
    [({context}) => context.marker == 'article' && context.gender == 'f', ({g, context}) => 'la'],
    [({context}) => context.isProperty && context.language == 'french', ({g, context}) => `${g({marker: 'article', gender: context.gender})} ${g(context.propertyName)} de ${g(context.object)} est ${g(context.value)}`],
    [({context}) => context.isProperty, ({g, context}) => `the ${context.propertyName} of ${g(context.object)} is ${g(context.value)}`],
    [({context}) => context.marker == 'number', ({g, context}) => `${g(context.value)}`],
    [({context}) => context.marker == 'equal', ({g, context}) => `${g(context.objects[1])}`],
    [({context}) => context.marker == 'conj', ({g, context}) => `${context.value.map( (c) => g(c) ).join('and')}`],
    [({context}) => context.marker == 'move' && context.language == 'french', ({g, context}) => `deplacez ${g(context.thing)} vers ${g(context.place)}`],
    [({context}) => context.marker == 'move', ({g, context}) => `move ${g(context.thing)} to ${g(context.place)}`],
    [({context}) => context.marker == 'create', ({g, context}) => `create ${g(context.klass)}`],
    [({context}) => context.marker == 'destroy', ({g, context}) => `destroy ${g(context.name)}`],
    [({context}) => context.marker == 'alias' && context.language == 'french', ({g, context}) => `appellez ${g(context.thing)} ${g(context.name.value)}`],
    [({context}) => context.marker == 'alias', ({g, context}) => `call ${g(context.thing)} ${g(context.name.value)}`],
    [({context}) => context.marker == 'commander', ({g, context}) => 'commander'],
    [({context}) => context.marker == 'commandeur', ({g, context}) => 'commandeur'],
    [({context}) => context.marker == 'cia', ({g, context}) => 'CIA'],
    [({context}) => context.marker == 'stop', ({g, context}) => `stop ${g(context.thing)}`],
    [({context}) => context.marker == 'destroy', ({g, context}) => `destroy ${g(context.name)}`],
  ],
  "semantics": [
    [({objects, context}) => context.marker == 'create'
, ({objects, context}) => { 
    if (context.klass.marker === 'tankConcept') {
      if (!objects.newTanks) {
        objects.newTanks = []
      }
      const tank = objects.newTank(context)
      if (!objects.mentioned) {
        objects.mentioned = []
      }
      objects.mentioned.push({ marker: 'tankConcept', word: tank.name, id: tank.id })
    } else if (context.klass.marker === 'buildingConcept') {
      if (!objects.newBuildings) {
        objects.newBuildings = []
      }
      const building = objects.newBuilding(context)
      if (!objects.mentioned) {
        objects.mentioned = []
      }
      objects.mentioned.push({ marker: 'buildingConcept', word: building.name, id: building.id })
    }
     }],
  ],
};