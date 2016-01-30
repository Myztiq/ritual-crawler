ig.module(
  'game.entities.spellSheet'
  )
  .requires(
    'plugins.box2d.entity'
  )
  .defines(function () {

    EntitySpellSheet = ig.Box2DEntity.extend({

      size: {x: 16, y: 16},

      spell: null,
      type: ig.Entity.TYPE.B,
      checkAgainst: ig.Entity.TYPE.A,
      collides: ig.Entity.COLLIDES.PASSIVE,

      animSheet: new ig.AnimationSheet('media/scroll_fire_16.png', 16, 16),

      init: function (x, y, settings) {
        this.addAnim('idle', 1, [0]);
        this.parent(x, y, settings);
        console.log(this);
      },

      collision: {group: 'item', name: 'spellSheet', collidesWith: ['player']},
      onContact: function (initiator) {
        this.kill(this);

        this.assignSpell(initiator);
        initiator.addToSpellBook(this);
      },

      assignSpell: function (player) {
        var spellsOfLevel = Spells.filter(function (spell) {
          return spell.level === 1;
        });

        var newSpellsOfLevel = spellsOfLevel.filter(function (spell){
          var knownByPlayer = (player.knownSpells.indexOf(spell) >= 0);
          if (knownByPlayer) {
            return false;
          } else {
            return true;
          }
        });

        var randomSpell = spellsOfLevel[Math.floor(Math.random() * spellsOfLevel.length)];
        this.spell = randomSpell;
        return randomSpell;
      }

    });

  });
