const CONFIG = {
  url: "https://www.dragapult.xyz/break-my-team", 
  limit: {
    spreads: 1, // # of spreads to display (damage only)
    moves: 10, // # of moves to display (damage only)
    items: 1, // # of items to display (damage only)
    teras: 1, // # of tera types to display (damage only)
    mons: 60 // # of mons to rank (both damage and speed tiers)
  }, 
  usage: {
    ability: 10, // Min. Usage % to display ability (speed tiers)
    item: 10 // Min. Usage % to display item (speed tiers)
  }, 
  quiz: {
    speed: {
      // Set to '1' for no speed ties
      min: 1, // Min. Variance
      max: 40, // Max. Variance
    },
    damage: {
      min: 30, // Max. Damage %
      max: 120, // Max. Damage %
    }
  },
  settings: {
    load: false, // Load settings on 'share'
    save: false, // Save settings on 'share'
  }, 
  scarf: 100 // Min. Speed (EVs) for scarf (speed tiers)
}
