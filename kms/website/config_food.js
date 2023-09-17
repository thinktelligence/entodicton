// This file contains all the config for the natural language interface

module.exports = 
{
  "flatten": [
    "conj",
  ],
  "implicits": [
    "language",
  ],
  "floaters": [
    "isQuery",
  ],
  "bridges": [
    {"bridge": "{ ...next(operator) }", "id": "food", "level": 0},
    {"bridge": "{ ...next(operator) }", "id": "mcdonalds", "level": 0},
    {"bridge": "{ ...next(operator) }", "id": "whitespot", "level": 0},
    {"bridge": "{ ...next(operator) }", "id": "i", "level": 0},
    {"bridge": "{ ...next(operator), action: 'order', items: after[0], store: after[1].from }", "id": "wantMcDonalds", "level": 0},
    {"bridge": "{ ...next(operator), action: 'order', items: after[0], store: after[1].from }", "id": "wantWhitespot", "level": 0},
    {"bridge": "{ ...next(operator), from: after[0] }", "id": "fromM", "level": 0},
    {"bridge": "{ ...next(operator), from: after[0] }", "id": "fromW", "level": 0},
  ],
  "utterances": [
    "i want 2 fries and a cheeseburger from mcdonalds",
    "i want a cheeseburger and fries from whitespot",
    "3 cheeseburgers and 2 fries",
    "2 fries and a cheeseburger",
    "a cheeseburger and fries",
    "a cheeseburger",
    "1 cheeseburger",
    "i want fries and a cheeseburger from mcdonalds",
    "i want fries from mcdonalds",
    "i want cheeseburger and fries from whitespot",
  ],
  "generators": [
    [({context}) => context.marker == 'wantWhitespot', ({g, context}) => `order for ${g(context.items)} from ${g(context.store)}`],
    [({context}) => context.marker == 'wantMcDonalds', ({g, context}) => `order for ${g(context.items)} from ${g(context.store)}`],
    [({context}) => context.marker == 'food' && context.number > 0, ({g, context}) => `${g(context.number)} ${g(context.name)}`],
    [({context}) => context.marker == 'food' && !('number' in context), ({g, context}) => `${g(context.name)}`],
    [({context}) => context.marker == 'whitespot', ({g, context}) => 'Whitespot'],
    [({context}) => context.marker == 'mcdonalds', ({g, context}) => 'McDonalds'],
  ],
  "semantics": [
  ],
  "operators": [
    "(([i]) [wantMcDonalds|want] ([food]) ([fromM|from] ([mcdonalds])))",
    "(([i]) [wantWhitespot|want] ([food]) ([fromW|from] ([whitespot])))",
    "(<count> ([food]))",
    "(<aEnglish> ([food]))",
    "(([food]) [conj] ([food]))",
  ],
  "hierarchy": [
  ],
  "associations": {
    "positive": [],
    "negative": [],
  },
  "words": {
    "fries": [{"id": "food", "initial": {"name": "fries", "number": "many"}}],
    "cheeseburgers": [{"id": "food", "initial": {"name": "cheeseburger"}}],
    "cheeseburger": [{"id": "food", "initial": {"name": "cheeseburger"}}],
  },
  "priorities": [
    [["conj", 0], ["plus", 0]],
  ],
};