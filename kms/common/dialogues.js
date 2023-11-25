const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const meta = require('./meta.js')
const _ = require('lodash')
const { isMany } = require('./helpers')
const dialogues_tests = require('./dialogues.test.json')
const { indent, focus } = require('./helpers')
const pluralize = require('pluralize')

class API {
  //
  // duck typing: for operators you want to use here
  //
  //   1. Use hierarchy to make them an instance of queryable. For example add hierarchy entry [<myClassId>, 'queryable']
  //   2. For semantics, if evaluate == true then set the 'value' property of the operator to the value.
  //   3. Generators will get contexts with 'response: true' set. Used for converting 'your' to 'my' to phrases like 'your car' or 'the car'.
  //   4. Generators will get contexts with 'instance: true' and value set. For converting values like a date to a string.
  //

  // used with context sensitive words like 'it', 'that' etc. for example if you have a sentence "create a tank"
  // then call mentioned with the tank created. Then if one asks 'what is it' the 'it' will be found to be the tank.

  setBrief(value) {
    this.objects.brief = value
  }

  getBrief() {
    return this.objects.brief
  }

  mentioned(concept, value = undefined) {
    if (value) {
      concept = { ...concept }
      if (concept.marker == 'unknown') {
        if (concept.value) {
          concept.marker = concept.value
        }
      }
      concept.value = value
    }
    this.objects.mentioned.unshift(concept)
  }

  mentions(context) {
    for (let m of this.objects.mentioned) {
      if (m.marker == context.marker) {
        return m
      }
      if (context.types && context.types.includes(m.marker)) {
        return m
      }
    }
    for (let m of this.objects.mentioned) {
      if (context.unknown) {
        return m
      }
    }
  }

  getVariable(name) {
    if (!name) {
      return
    }
    let valueNew = this.mentions({ marker: name }) || name
    if (valueNew && valueNew.value) {
      valueNew = valueNew.value
    }
    return valueNew
  }

  setVariable(name, value) {
    this.mentioned({ marker: name }, value)
  }

  evaluateToWord(value, g) {
    return g({ ...value, evaluateToWord: true })
  }

  evaluateToConcept(value, context, log, s) {
    value.evaluate = { toConcept: true }
    // const concept = s(value, { debug: { apply: true } }) 
    const concept = s(value)
    if (!concept.evalue && !concept.verbatim) {
      warningNotEvaluated(log, value);
      concept.evalue = concept.value
    }
    delete concept.evaluate
    return concept
  }

  setupObjectHierarchy(config, id, { types } = {}) {
    for (let type of types) {
      config.addHierarchy(id, type)
    }
  }

  // word is for one or many
  makeObject({config, context, types=[], doPluralize=true} = {}) {
    if (!context.unknown) {
      return context.value
    }
    const { word, value, number } = context;
    const concept = pluralize.singular(value)
		if (config.exists(concept)) {
			return concept
		}
    config.addOperator({ pattern: `([${concept}])`, allowDups: true })
    config.addBridge({ id: concept, level: 0, bridge: "{ ...next(operator) }" , allowDups: true })
    const addConcept = (word, number) => {
      config.addWord(word, { id: concept, initial: `{ value: "${concept}", number: "${number}" }` } )
      const baseTypes = [
        'theAble',
        'queryable',
        'isEdee',
        'isEder',
      ];

      const allTypes = new Set(baseTypes.concat(types))
      this.setupObjectHierarchy(config, concept, {types: allTypes});
    }

    if (pluralize.isSingular(word)) {
      addConcept(word, 'one')
      doPluralize && addConcept(pluralize.plural(word), 'many')
    } else {
      doPluralize && addConcept(pluralize.singular(word), 'one')
      addConcept(word, 'many')
    }

    // mark greg as an instance?
    // add a generator for the other one what will ask what is the plural or singluar of known
    /*
    if (number == 'many') {
    } else if (number == 'one') {
    }
    */
    return concept;
  }
}

const api = new API()

const warningIsANotImplemented = (log, context) => {
  const description = 'WARNING from Dialogues KM: For semantics in order to handle sentences of type "x is y?", set the response to what you like.'
  const match = `({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.query && <other conditions as you like>`
  const apply = `({context}) => <do stuff...>; context.evalue = <value>`
  const input = indent(JSON.stringify(context, null, 2), 2)
  const message = `${description}\nThe semantic would be\n  match: ${match}\n  apply: ${apply}\nThe input context would be:\n${input}\n`
  log(indent(message, 4))
}

const warningNotEvaluated = (log, value) => {
  const description = 'WARNING from Dialogues KM: For semantics, implement an evaluations handler, set "value" property of the operator to the value.'
  const match = `({context}) => context.marker == '${value.marker}' && context.evaluate && <other conditions as you like>`
  const apply = `({context}) => <do stuff...>; context.value = <value>`
  const input = indent(JSON.stringify(value, null, 2), 2)
  const message = `${description}\nThe semantic would be\n  match: ${match}\n  apply: ${apply}\nThe input context would be:\n${input}\n`
  log(indent(message, 4))
}

const warningSameNotEvaluated = (log, one) => {
  const description = 'WARNING from Dialogues KM: For the "X is Y" type phrase implement a same handler.'
  const match = `({context}) => context.marker == '${one.marker}' && context.same && <other conditions as you like>`
  const apply = '({context}) => <do stuff... context.same is the other value>; context.sameWasProcessed = true'
  const input = indent(JSON.stringify(one, null, 2), 2)
  const message = `${description}\nThe semantic would be\n  match: ${match}\n  apply: ${apply}\nThe input context would be:\n${input}\n`
  log(indent(message, 4))
}

// TODO implement what / what did you say ...
let config = {
  name: 'dialogues',
  operators: [
    "(([queryable]) [is|] ([queryable|]))",
    "([is:queryBridge|] ([queryable]) ([queryable]))",
    // "(([queryable]) [is:isEdBridge|is,are] ([isEdAble|]))",
    "(([queryable]) [(<isEd|> ([isEdAble|]))])",
    "([it])",
    "(<what> ([whatAble|]))",
    "([what:optional])",
    "(<the|> ([theAble|]))",
    "(<a|a,an> ([theAble|]))",
    "([unknown])",
    "([not] ([notAble|]))",

    "([preposition])",

    "([be] ([briefOrWordy|]))",

    "([([canBeQuestion])])",
    "(([canBeQuestion/1,2]) <questionMark|>)",
    // "(([is/2]) <questionMark|>)",

    "(([what]) [(<does|> ([doesAble|]))])",
    "([canBeDoQuestion])",
    "(<does|> ([canBeDoQuestion/0,1]))",
    // make what is it work <<<<<<<<<<<<<<<<<<<<<<<, what is greg
    // joe is a person the age of joe ...
    //"arm them, what, the phasers"
    //greg is a first name
    "(([theAble|]) [list|and] ([theAble|]))",
    "([yesno|])",
    "([articlePOS|])",
    "(([isEdee])^ <isEdAble|> ([by] ([isEder])?))",
    "([isEdee|])",
    "([isEder|])",
    { pattern: "([debug23])" },

    "([this])",
    "([verby])",
    "([pronoun])",
    "([to] ([toAble|]))",
  ],
  associations: {
    negative: [
      // [['isEd', 0], ['unknown', 0]],
      // [['isEd', 0], ['unknown', 1]],
      // [['is', 0], ['means', 0]],
    ],
    positive: [
      // [['is', 0], ['unknown', 0]],
      // [['is', 0], ['unknown', 1]],
      // [['isEd', 0], ['means', 0]],
      [['isEdee', 0], ['isEd', 0], ['isEder', 0], ['by', 0]],
      [['isEdee', 0], ['isEd', 0], ['isEdAble', 0]],
      [['unknown', 1], ['isEd', 0], ['isEdAble', 0]],
      [['unknown', 0], ['isEd', 0], ['isEdAble', 0]],
      [["isEd",0],["unknown",1],["isEdAble",0]],

    ]
  },
  bridges: [
    { id: "preposition", level: 0, bridge: "{ ...next(operator) }" },
    { id: "by", level: 0, bridge: "{ ...next(operator), object: after[0] }", optional: { 'isEder': "{ marker: 'unknown', implicit: true, concept: true }", }, },

    { id: "pronoun", level: 0, bridge: "{ ...next(operator) }" },
    { id: "verby", level: 0, bridge: "{ ...next(operator) }" },
    { id: "articlePOS", level: 0, bridge: "{ ...next(operator) }" },
    { id: "debug23", level: 0, bridge: "{ ...next(operator) }" },
    // { id: "what", level: 0, bridge: "{ ...next(operator), ...after[0], query: ['what'], determined: true }" },
    { id: "what", level: 0, optional: "{ ...next(operator), query: ['what'], determined: true }", bridge: "{ ...after, query: ['what'], modifiers: ['what'], what: operator }" },
    { id: "whatAble", level: 0, bridge: "{ ...next(operator) }" },

    {id: "list", level: 0, selector: {match: "same", left: [ { variable: 'type' } ], right: [ { variable: 'type' } ], passthrough: true}, bridge: "{ ...next(operator), value: append(before, after) }"},
    {id: "list", level: 1, selector: {match: "same", left: [ { variable: 'type' } ], passthrough: true}, bridge: "{ ...operator, value: append(before, operator.value) }"},

    { id: "to", level: 0, 
        bridge: "{ ...next(operator), object: after[0] }",
        generatorp: ({context, gp}) => {
          return `to ${gp(context.object)}`
        },
    },
    { id: "toAble", level: 0, bridge: "{ ...next(operator) }" },

    { id: "this", level: 0, bridge: "{ ...next(operator), unknown: true, pullFromContext: true }" },
    { id: "be", level: 0, bridge: "{ ...next(operator), type: after[0] }" },
    { id: "briefOrWordy", level: 0, bridge: "{ ...next(operator) }" },

    { id: "notAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "not", level: 0, bridge: "{ ...after, negated: true }" },

    { id: "yesno", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeQuestion", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeQuestion", level: 1, bridge: "{ ...next(operator) }" },
    // greg101
    { id: "unknown", level: 0, bridge: "{ ...next(operator), unknown: true }" },
    { id: "unknown", level: 1, bridge: "{ ...next(operator) }" },
    { id: "queryable", level: 0, bridge: "{ ...next(operator) }" },
    { id: "questionMark", level: 0, bridge: "{ ...before[0], query: [before.marker] }" },
    // { id: "isEd", level: 0, bridge: "{ ...context, query: true }" },
    // gregbug
    // context.subject == ['owner'] but could be list of properties
    // { id: "isEd", level: 0, bridge: "{ number: operator.number, ...context, [subject].number: operator.number }" },
    // { id: "isEd", level: 0, bridge: "{ number: operator.number, ...context, properties(subject).number: operator.number }" },
    // NO or symlink subject: link(current.ownee)  // any other operator...
    // NO { id: "isEd", level: 0, bridge: "{ number: operator.number, ...context, subject.number: operator.number }" },
    { id: "isEd", level: 0, bridge: "{ number: operator.number, ...context, [context.subject].number: operator.number }" },
    // { id: "isEd", level: 0, bridge: "{ ...context }" },
    { id: "isEdAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "isEdAble", level: 1, bridge: "{ ...next(operator) }" },
    { id: "isEdee", level: 0, bridge: "{ ...next(operator) }" },
    { id: "isEder", level: 0, bridge: "{ ...next(operator) }" },
    { id: "is", level: 0, 
            bridge: "{ ...next(operator), one: { number: operator.number, ...before[0] }, two: after[0] }", 
            queryBridge: "{ ...next(operator), one: after[0], two: after[1], query: true }" ,
    },
    { id: "is", level: 1, bridge: "{ ...next(operator) }" },

    { id: "canBeDoQuestion", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeDoQuestion", level: 1, bridge: "{ ...next(operator) }" },
    { id: "canBeDoQuestion", level: 2, bridge: "{ ...next(operator) }" },
    { id: "doesAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "doesAble", level: 1, bridge: "{ ...next(operator), before: before[0] }" },
    { id: "does", level: 0, bridge: "{ query: true, what: operator.marker, ...context, number: operator.number, object.number: operator.number }*" },

    // { id: "the", level: 0, bridge: "{ ...after[0], pullFromContext: true }" },
    { id: 'the', level: 0, bridge: '{ ...after[0], pullFromContext: true, concept: true, wantsValue: true, determiner: "the", modifiers: append(["determiner"], after[0].modifiers)}' },

    { id: "a", level: 0, bridge: "{ ...after[0], pullFromContext: false, concept: true, number: 'one', wantsValue: true, determiner: 'a', modifiers: append(['determiner'], after[0].modifiers) }" },
    { id: "theAble", level: 0, bridge: "{ ...next(operator) }" },

    // TODO make this hierarchy thing work
    { id: "it", level: 0, hierarchy: ['queryable'], bridge: "{ ...next(operator), pullFromContext: true, unknown: true, determined: true }" },
  ],
  words: {
    "?": [{"id": "questionMark", "initial": "{}" }],
    "the": [{"id": "the", "initial": "{ modifiers: [] }" }],
    "who": [{"id": "what", "initial": "{ modifiers: [], query: true }" }],
    "yes": [{"id": "yesno", "initial": "{ value: true }" }],
    "no": [{"id": "yesno", "initial": "{ value: false }" }],
    "brief": [{"id": "briefOrWordy", "initial": "{ value: 'brief' }" }],
    "wordy": [{"id": "briefOrWordy", "initial": "{ value: 'wordy' }" }],
    "does": [{"id": "does", "initial": "{ number: 'one' }" }],
    "do": [{"id": "does", "initial": "{ number: 'many' }" }],
    "is": [{"id": "is", "initial": "{ number: 'one' }" }, {"id": "isEd", "initial": "{ number: 'one' }" }],
    "are": [{"id": "is", "initial": "{ number: 'many' }" }, {"id": "isEd", "initial": "{ number: 'many' }" }],
  },

  floaters: ['query'],
  priorities: [
    [['means', 0], ['is', 0]],
    [['questionMark', 0], ['is', 0]],
    [['questionMark', 0], ['is', 1]],
    [['questionMark', 0], ['isEd', 0]],
    [["does",0],["what",0]],
    [["is",0],["what",0]],
    [["is",1],["what",0]],
    [["is",0],["articlePOS",0]],
    [["is",1],["is",0]],
    [["isEd",0],["isEdAble",0]],
    [['is', 0], ['does', 0], ['a', 0]],
    [['means', 0], ['isEd', 0]],
    [['is', 0], ['by', 0]],
    [['by', 0], ['articlePOS', 0]],
    [['by', 0], ['what', 0]],
    [['isEdAble', 0], ['articlePOS', 0]],
    [['is', 0], ['isEdAble', 0]],
    [['is', 1], ['isEdAble', 0]],
    [['verby', 0], ['pronoun', 0]],
    [['verby', 0], ['preposition', 0]],
    [['verby', 0], ['articlePOS', 0]],
  ],
  hierarchy: [
    ['it', 'pronoun'],
    ['this', 'pronoun'],
    ['questionMark', 'isEd'],
    ['a', 'articlePOS'],
    ['the', 'articlePOS'],
    ['unknown', 'notAble'],
    ['unknown', 'theAble'],
    ['unknown', 'queryable'],
    // ['unknown', 'isEdee'],
    // ['unknown', 'isEder'],
    // ['isEdee', 'unknown'],
    // ['isEder', 'unknown'],
    ['it', 'queryable'],
    ['what', 'queryable'],
    ['whatAble', 'queryable'],
    ['is', 'canBeQuestion'],
    ['it', 'toAble'],
    ['this', 'queryable'],
    // ['isEd', 'means'],
    // ['is', 'means'],
  ],
  debug: false,
  version: '3',
  generators: [
    {
      notes: "handle making responses brief",
      where: where(),
      match: ({context, objects}) => (context.topLevel || context.isResponse) && objects.brief && !context.briefWasRun,
      apply: ({context, g}) => {
        const focussed = focus(context)
        context.briefWasRun = true
        return g(focussed)
      },
      priority: -2,
    },
    {
      notes: "unknown ",
      where: where(),
      match: ({context}) => context.marker == 'unknown' && context.implicit,
      apply: ({context}) => '',
    },
    {
      notes: "unknown answer default response",
      where: where(),
      match: ({context}) => context.marker == 'answerNotKnown',
      apply: ({context}) => `that is not known`,
    },
    {
      notes: "be brief or wordy",
      where: where(),
      match: ({context}) => context.marker == 'be',
      apply: ({context}) => `be ${context.type.word}`,
    },
    /*
    {
       notes: 'paraphrase: plural/singular',
       priority: -1,
      where: where(),
       match: ({context}) => context.paraphrase && context.word
       apply: ({context, g}) => { return { "self": "your", "other": "my" }[context.value] },
    },
    */
    {
      where: where(),
      match: ({context}) => context.marker === 'idontknow',
      apply: ({context}) => "i don't know",
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'yesno',
      apply: ({context}) => context.value ? 'yes' : 'no',
      priority: -1,
      // debug: 'call11',
    },
    {
      where: where(),
      match: ({context}) => !context.paraphrase && context.evalue && context.evalue.marker == 'yesno',
      apply: ({context}) => context.evalue.value ? 'yes' : 'no',
      priority: -1,
    },
    /*
     * modifiers = <list of properties>
     */
    [
      //({context}) => context.paraphrase && context.modifiers,
      ({context}) => context.paraphrase && context.modifiers,
      ({context, g}) => {
        const text = []
        for (modifier of context.modifiers) {
          text.push(g(context[modifier]))
        }
        text.push(context.word)
        return text.join(' ')
      }
    ],

    {
      notes: 'handle lists with yes no',
      // ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value,
      // ({context, hierarchy}) => context.marker == 'list' && context.value,
      where: where(),
      match: ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value && context.value.length > 0 && context.value[0].marker == 'yesno',
      apply: ({context, g, gs}) => {
        return `${g(context.value[0])} ${gs(context.value.slice(1), ', ', ' and ')}`
      }
    },

    {
      notes: 'handle lists',
      // ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value,
      // ({context, hierarchy}) => context.marker == 'list' && context.value,
      where: where(),
      match: ({context, hierarchy}) => context.marker == 'list' && context.value,
      apply: ({context, gs}) => {
        if (context.newLinesOnly) {
          return gs(context.value, '\n')
        } else {
          return gs(context.value, ', ', ' and ')
        }
      }
    },

    {
      notes: 'paraphrase a negation',
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'notAble') && context.negated, // && !context.isQuery && !context.paraphrase && context.value,
      apply: ({context, g}) => {
        context.negated = false
        const result = g(context.value)
        context.negated = true
        return `not ${result}`
      }
    },

    {
      notes: 'paraphrase a queryable response',
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.evalue && !context.paraphrase,
      apply: ({context, g}) => {
        return g(context.evalue)
      }
    },
    {
      notes: 'paraphrase a queryable',
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && !context.paraphrase && context.evalue,
      apply: ({context, g}) => {
        const oldValue = context.evalue.paraphrase
        const result = g(context.evalue)
        context.evalue.paraphrase = oldValue
        return result
      }
    },
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.isSelf && context.subject == 'my',
      ({context}) => `your ${context.word}`
    ],
    [ 
      ({context, hierarchy}) => ['it', 'what'].includes(context.marker) && context.paraphrase, 
      ({g, context}) => `${context.marker}`
    ],
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.isSelf && context.subject == 'your',
      ({context}) => `my ${context.word}`
    ],
    [ 
      ({context, hierarchy}) => ['my', 'your'].includes(context.subject) && hierarchy.isA(context.marker, 'queryable') && context.paraphrase, 
      ({g, context}) => `${context.subject} ${context.marker}`
    ],
    [ 
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'theAble') && context.paraphrase && context.wantsValue && !context.pullFromContext, 
      ({g, context}) => `a ${context.word}`
    ],
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.subject,
      ({context}) => `${context.subject} ${context.word}`
    ],
    [ 
      ({context}) => context.marker == 'unknown', 
      ({context}) => {
        if (typeof context.marker === 'string') {
          return context.value
        } else if (context.value) {
          JSON.stringify(context.value)
        } else {
          return context.word
        }
      }
    ],
    [ 
      ({context}) => context.marker == 'what' && (context.evalue || context.paraphrase), 
      ({context}) => `what` 
    ],
    [ 
      ({context}) => context.marker == 'it' && !context.isQuery && !context.instance, 
      ({context}) => `it` 
    ],
    [ 
      ({context}) => context.marker == 'it' && !context.isQuery && context.instance, 
      ({context}) => context.value
    ],
    [ 
      ({context}) => context.marker == 'name' && !context.isQuery && context.subject, 
      ({context}) => `${context.subject} ${context.word}` 
    ],
    {
      where: where(),
      match: ({context}) => context.evalue && context.evalue.verbatim && !context.paraphrase,
      apply: ({context}) => context.evalue.verbatim,
    },
    {
      where: where(),
      match: ({context}) => context.isResponse && context.verbatim && !context.paraphrase,
      apply: ({context}) => context.verbatim,
      priority: -1,
    },
    { 
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'canBeQuestion') && context.paraphrase && context.topLevel && context.query,
      apply: ({context, gp}) => {
        return `${gp({...context, topLevel: undefined})}?` 
      },
      priority: -1,
    },
    { 
      notes: "x is y",
      where: where(),
      match: ({context, hierarchy}) => { return hierarchy.isA(context.marker, 'is') && context.paraphrase },
      apply: ({context, g, gp}) => {
        return `${g({ ...context.one, paraphrase: true })} ${context.word} ${gp(context.two)}` 
      }
    },
    { 
      notes: 'is with a response defined',
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.evalue,
      apply: ({context, g}) => {
        const response = context.evalue;
        const concept = response.concept;
        if (concept) {
          concept.paraphrase = true
          concept.isSelf = true
          const instance = g(response.instance)
          return `${g(concept)} ${context.word} ${instance}` 
        } else {
          return `${g(response)}` 
        }
      }
    },
    { 
      notes: 'x is y (not a response)',
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && !context.evalue,
      apply: ({context, g}) => {
        if ((context.two.evalue || {}).marker == 'answerNotKnown') {
          return g(context.two.evalue)
        }
        if (context.two.focusableForPhrase) {
          return `${g(context.two)} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${g({...context.one, paraphrase: true}, { assumed: { subphrase: true } })}`
        } else {
          return `${g({...context.one, paraphrase: true}, { assumed: {subphrase: true} })} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${g(context.two)}`
        }
        // return `${g({...context.one})} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${g(context.two)}`
      },
    },

    {
      priority: -3,
      where: where(),
      match: ({context}) => context.evaluateToWord && context.word,
      apply: ({context}) => context.word,
    },

    // defaults
    {
      notes: 'show the input word',
      where: where(),
      match: ({context}) => context.paraphrase && context.word,
      apply: ({context}) => `${context.word}` 
    },

    [
      ({context}) => context.verbatim,
      ({context}) => context.verbatim
    ],

    [
      ({context}) => context.evalue,
      ({context, g}) => g(context.evalue)
    ],

    [
      ({context}) => context.evalue,
      ({context}) => `the ${context.word}` 
    ],

    {
      notes: 'show word',
      where: where(),
      match: ({context}) => context.word,
      apply: ({context}) => context.word,
    },

    {
      notes: 'show json',
      where: where(),
      match: () => true,
      apply: ({context}) => JSON.stringify(context)
    }
  ],

  semantics: [
    {
      todo: 'debug23',
      where: where(),
      match: ({context}) => context.marker == 'debug23',
      apply: ({context, hierarchy}) => {
        debugger
        debugger
      },
    },
    { 
      todo: 'be brief or wordy',
      where: where(),
      match: ({context}) => context.marker == 'be',
      apply: ({context, api}) => {
        api.setBrief( context.type.value == 'brief' )
      },
    },
    { 
      notes: 'pull from context',
      where: where(),
      // match: ({context}) => context.marker == 'it' && context.pullFromContext, // && context.value,
      match: ({context}) => context.pullFromContext && !context.same, // && context.value,
      apply: ({context, s, api, e, log, retry}) => {
        context.value = api.mentions(context)
        if (!context.value) {
          // retry()
          context.value = { marker: 'answerNotKnown' }
          return
        }
        const instance = e(context.value)
        if (instance.evalue && !instance.edefault) {
          context.value = instance.evalue
        }
      },
    },
    { 
      notes: 'what x is y?',
      where: where(),
      /*
        what type is object (what type is pikachu)   (the type is typeValue)
        what property is object (what color are greg's eyes)
        object is a type (is greg a human) // handled by queryBridge
      */

      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.query,
      apply: ({context, s, log, km, objects, e}) => {
        const one = context.one;
        const two = context.two;
        let concept, value;
        if (one.query) {
          concept = one;
          value = two;
        } else {
          concept = two;
          value = one;
        }
        // km('dialogues').api.mentioned(concept)
        // TODO wtf is the next line?
        value = JSON.parse(JSON.stringify(value))
        let instance = e(value)
        if (instance.evalue) {
          km('dialogues').api.mentioned(value)
        }
        if (instance.verbatim) {
          context.evalue = { verbatim: instance.verbatim }
          context.isResponse = true
          return
        }
        // instance.focusable = ['one', 'two']
        instance.focus = true
        // concept = JSON.parse(JSON.stringify(value)) 
        concept = _.cloneDeep(value) 
        concept.isQuery = undefined

        const many = isMany(concept) || isMany(instance)
        const evalue = {
          "default": true,
          "marker": "is",
          "one": concept,
          "two": instance,
          "focusable": ['two', 'one'],
          "word": many ? "are" : "is",
          "number": many ? "many" : undefined,
        }
        context.evalue = evalue
        context.isResponse = true
      }
    },
    { 
      notes: 'x is y?',
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.query,
      apply: ({context, log}) => {
        warningIsANotImplemented(log, context)
        context.evalue = {
          verbatim: "I don't know"
        }
        context.isResponse = true
      }
    },

    // statement
    { 
      where: where(),
      notes: 'x is y',
      match: ({context}) => context.marker == 'is' && !context.query && context.one && context.two,
      apply: ({context, s, log, api, config}) => {
        const one = context.one;
        const two = context.two;
        one.same = two;
        const onePrime = s(one)
        if (!onePrime.sameWasProcessed) {
          warningSameNotEvaluated(log, one)
        } else {
          if (onePrime.evalue) {
            context.evalue = onePrime.evalue
            context.isResponse = true
          }
        }
        one.same = undefined
        let twoPrime;
        if (!onePrime.sameWasProcessed) {
          two.same = one
          twoPrime = s(two)
          if (!twoPrime.sameWasProcessed) {
            warningSameNotEvaluated(log, two)
          } else {
            if (twoPrime.evalue) {
              context.evalue = twoPrime.evalue
            }
          }
          two.same = undefined
        }
        if (!onePrime.sameWasProcessed && !twoPrime.sameWasProcessed) {
					api.makeObject({ context: one, config, types: context.two.types || [] })
					api.setVariable(one.value, two)
					api.mentioned(one, two)
        }
      }
    },
    {
      notes: 'default handle evaluate',
      where: where(),
      match: ({context}) => context.evaluate,
      apply: ({context, api, e}) => {
        // greg101
        if (true) {
          context.value = api.getVariable(context.value)
          if (!context.value && context.marker !== 'unknown') {
            context.value = api.getVariable(context.marker)
          }
        } else {
          let value = api.getVariable(context.value || context.marker)
          if (value.marker == context.marker && value.value == context.value && value.evalue == context.evalue) {
            return
          }
          context.value = value
        }
        if (context.value && context.value.marker) {
          context.evalue = e(context.value)
        }
      }
    },
    /*
    {
      priority: 2,
      notes: 'evaluate top level not already done',
      match: ({context}) => false && context.topLevel && !context.evalue,
      apply: ({context, e}) => {
        const instance = e({ ...context, value: undefined, topLevel: undefined })
        if (instance.evalue && !instance.edefault) {
          context.evalue = instance
          context.isResponse = true
        }
      }
    },
    */
  ],
};


config = new Config(config, module)
config.api = api
config.add(meta)

config.initializer( ({objects, config, api, isModule}) => {
  objects.mentioned = []
  objects.variables = {
  }
  if (isModule) {
  } else {
    config.addWord("canbedoquestion", { id: "canBeDoQuestion", "initial": "{}" })
    config.addWord("doesable", { id: "doesAble", "initial": "{}" })
  }
  config.addArgs((args) => ({ e: (context) => api.getEvaluator(args.s, args.log, context) }))
})

knowledgeModule( { 
  module,
  description: 'framework for dialogues',
  config,
  test: {
    name: './dialogues.test.json',
    contents: dialogues_tests
  },
  /*
  module: () => {
    config.initializer( ({objects, api, uuid}) => {
      objects.dialog = {
          current: []
      }
    })

    module.exports = config
  }
  */
})
