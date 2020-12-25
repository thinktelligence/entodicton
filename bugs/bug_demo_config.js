// This is a demo config file for the submitting bugs workflow. Two new properties are added expected_results and expected_generated

module.exports = {
  expected_results: 
    [ [
        {
          "marker": "worked",
          "who": "sally",
          "duration": 10,
          "units": "weekConcept"
        }
    ] ],
  expected_generated: [["sally worked 10 week2"]],
  utterances: ["sally worked 10 weeks"],
  operators: [
    '(([personConcept]) [earn|earns] ((<count> ([dollarConcept])) [every] ([weekConcept])))',
    '(([personConcept]) [worked] (<count> ([weekConcept|weeks])))'
  ],
  bridges: [
    { "id": "count", "level": 0, "bridge": "{ ...operator, ...after, number: operator.value }" },

    { "id": "weekConcept", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "dollarConcept", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "personConcept", "level": 0, "bridge": "{ ...next(operator) }" },

    { "id": "every", "level": 0, "bridge": "{ marker: 'dollarConcept', units: 'dollars', amount: before.value, duration: 'week' }" },

    { "id": "earn", "level": 0, "bridge": "{ marker: 'earn', units: 'dollars', amount: after.amount, who: before.id, period: after.duration }" },
    { "id": "worked", "level": 0, "bridge": "{ marker: 'worked', who: before.id, duration: after.number, units: after.marker }" },
  ],
  priorities: [],
  "version": '3',
  "words": {
    " ([0-9]+)": [{"id": "count", "initial": "{ value: int(group[0]) }" }],
    "week": [{"id": "weekConcept", 'initial': { 'language': 'english' } }],
    "dollars": [{"id": "dollarConcept", 'initial': { 'language': 'english' } }],
    "joe": [{"id": "personConcept", 'initial': { 'id': 'joe' } }],
    "sally": [{"id": "personConcept", 'initial': { 'id': 'sally' } }],
    "per": [{"id": "every"}],
  },
  generators: [
    [ (context) => context.marker == 'earn', (g, context) => `${g(context.who)} earns ${g(context.amount)} ${g(context.units)} per ${context.period}` ],
    [ (context) => context.marker == 'weekConcept' && context.duration == 1, (g, context) => `${context.duration} week` ],
    [ (context) => context.marker == 'weekConcept' && context.duration > 1, (g, context) => `${context.duration} weeks` ],
    [ (context) => context.marker == 'worked', (g, context) => `${g(context.who)} worked ${ g({ marker: context.units, duration: context.duration}) }` ],
    [ (context) => context.marker == 'response', (g, context) => `${context.who} earned ${context.earnings} ${context.units}` ],
  ],

  semantics: [
    [(global, context) => context.marker == 'earn', (global, context) => {
      if (! global.employees ) {
        global.employees = []
      }
      global.employees.push({ name: context.who, earnings_per_period: context.amount, period: context.period, units: 'dollars' })
     }],
    [(global, context) => context.marker == 'worked', (global, context) => {
      if (! global.workingTime ) {
        global.workingTime = []
      }
      global.workingTime.push({ name: context.who, number_of_time_units: context.duration, time_units: context.units })
     }],
  ],
};
