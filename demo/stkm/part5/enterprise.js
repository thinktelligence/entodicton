const enterprise = {
  weapons: {
    photons: {
      armed: false
    },
    phasers: {
      _armed: false,
      get armed() {
        return enterprise.weapons._armed
      },
      set armed(value) {
        enterprise.weapons._armed = value
        enterprise.change()
      }
    }
  },

  ons: [],

  on: (match, apply) => {
    enterprise.ons.push( { match, apply } )
  },

  change: () => {
    enterprise.ons = enterprise.ons.filter( (on) => {
      if (on.match(enterprise)) {
        on.apply(enterprise)
        return false
      }
      return true
    })
  },
}

module.exports = {
  enterprise
}
