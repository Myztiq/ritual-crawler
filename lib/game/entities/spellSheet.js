ig.module(
  'game.entities.spellSheet'
  )
  .requires(
    'plugins.box2d.entity'
  )
  .defines(function () {

    EntitySpellSheet = ig.Box2DEntity.extend({

      size: {x: 32, y: 32},

      killme: false,

      spell: null,
      type: ig.Entity.TYPE.B,
      checkAgainst: ig.Entity.TYPE.A,
      collides: ig.Entity.COLLIDES.PASSIVE,

      animSheet: new ig.AnimationSheet('media/scroll_fire_16.png', 32, 32),

      init: function (x, y, settings) {
        Spells = [
          {
            "name": "Fire Ball",
            "icon": "spells/fireball.png",
            "damageBase": 1,
            "rangeBase": 10,
            "duration": 0,
            "entity": EntityFireball,
            "level": 1
          },
          {
            "name": "Laser Eyes",
            "icon": "spells/fireball.png",
            "damageBase": 1,
            "rangeBase": 10,
            "duration": 2,
            "entity": EntityLaser,
            "level": 1
          },
          //{
          //  "name": "Magic Missiles",
          //  "icon": "spells/fireball.png",
          //  "damageBase": 1,
          //  "rangeBase": 10,
          //  "duration": 2,
          //  "entity": EntityAttackHoming,
          //  "level": 1
          //},
          //{
          //  "name": "Impermeable Shield",
          //  "icon": "spells/protect-blue-1.png",
          //  "duration": 5,
          //  "expiration": 15,
          //  "stat": "armor",
          //  "powerTotal": 20,
          //  "entity": EntityAura,
          //  "level": 1
          //},
          //{
          //  "name": "Bees!",
          //  "icon": "fireball.png",
          //  "rangeBase": 10,
          //  "duration": 5,
          //  "expiration": 15,
          //  "stat": "speed",
          //  "powerTotal": 5,
          //  "entity": EntityDeBuffOther,
          //  "level": 1
          //},
          //{
          //  "name": "Curse of Reduced Armor",
          //  "icon": "fireball.png",
          //  "armorReductionBase": 10,
          //  "rangeBase": 10,
          //  "duration": 0,
          //  "expiration": 20,
          //  "stat": "armor",
          //  "powerTotal": 10,
          //  "entity": EntityDeBuffOther,
          //  "level": 1
          //},
          //{
          //  "name": "Healing Prayer",
          //  "icon": "spells/heal-sky-3.png",
          //  "duration": 0,
          //  "expiration": 10,
          //  "stat": "health",
          //  "powerPerSec": 2,
          //  "entity": EntityBuffSelf,
          //  "level": 1
          //},
          //{
          //  "name": "Spell of Fast Walk",
          //  "icon": "MISSING",
          //  "duration": 0,
          //  "expiration": 15,
          //  "stat": "speed",
          //  "powerTotal": 2,
          //  "entity": EntityBuffSelf,
          //  "level": 1
          //},
        ];
        this.addAnim('idle', 1, [0]);
        this.parent(x, y, settings);
      },

      collision: {group: 'item', name: 'spellSheet', collidesWith: ['player']},
      onContact: function (initiator) {
        this.kill();
        this.assignSpell(initiator);
        this.assignCombo(this.spell);
        initiator.addToSpellBook(this.spell);
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


        var randomSpell = newSpellsOfLevel.random();
        this.spell = randomSpell;
        return randomSpell;
      },

      assignCombo: function (spell) {
        if (spell === undefined) { return; }
        var buttons = [
          {direction: 'LEFT_ACTION',   ps: 'sony/square-icon.png',    xbox: null},
          {direction: 'UP_ACTION',     ps: 'sony/triangle-icon.png',  xbox: null},
          {direction: 'RIGHT_ACTION',  ps: 'sony/circle-icon.png',    xbox: null},
          {direction: 'DOWN_ACTION',   ps: 'sony/cross-icon.png',     xbox: null}
        ];

        var comboLength = 2 + spell.level;
        var combo = [];
        for (var i =0; i<comboLength; i++) {
          combo.push(buttons[Math.floor(Math.random() * buttons.length)])
        }
        spell.combo = combo;
      }

    });

  });
