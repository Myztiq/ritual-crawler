ig.module(
  'game.entities.shrine'
  )
  .requires(
    'plugins.box2d.entity',
    'game.entities.spellSheet'
  )
  .defines(function () {

    EntityShrine = ig.Box2DEntity.extend({

      size: {x: 32, y: 32},
      killme: false,

      type: ig.Entity.TYPE.B,
      checkAgainst: ig.Entity.TYPE.A,
      collides: ig.Entity.COLLIDES.PASSIVE,

      animSheet: new ig.AnimationSheet('media/tiles.png', 32, 64),
      zIndex: -1,

      init: function (x, y, settings) {
        this.icon = 'default.png';
        this.addAnim('idle', 1, [16 * 2]);
        this.addAnim('activated', 1, [16 * 2 + 1]);

        this.parent(x, y, settings);
        this.timer = new ig.Timer();
        this.deactivationTimer = new ig.Timer();
      },

      collision: {group: 'shrine', name: 'shrine', collidesWith: ['player']},
      onContact: function (initiator) {
        var self = this;
        if (this.finalShrine) {
          var allSkulls = true;
          Object.keys(initiator.inventory).forEach(function (key) {
            if (!initiator.inventory[key]) {
              allSkulls = false;
              return;
            }
            if (initiator.inventory[key].type !== 'skull') {
              allSkulls = false;
            }
          })
          if (!allSkulls) {
            // Logic to consume all the skulls in your inventory
            //Object.keys(initiator.inventory).forEach(function (key) {
            //  if (initiator.inventory[key].type === 'skull') {
            //    allSkulls = false;
            //    initiator.inventory[key] = null;
            //  }
            //})
            return;
          }
          alert('YOU WON ' + initiator.playerName + '!!!!');
          this.currentAnim = this.anims.activated;
          this.deactivationTimer.set(9999999);
        } else {
          if (this.deactivationTimer.delta() > 0) {
            Object.keys(initiator.inventory).find(function (key) {
              if (!initiator.inventory[key]) {
                return false;
              }
              if (initiator.inventory[key].type !== 'skull') {
                this.deactivationTimer.set(5);
                initiator.inventory[key] = null;
                $('.player' + initiator.playerName + ' .inventory .' + key).remove();
                self.giveUserSpell = initiator;
                return true;
              }
            })
          }
        }

      },
      update: function () {
        if (this.giveUserSpell) {
          if (this.giveUserSpell.knownSpells.length !== Spells.length) {
            ig.game.spawnEntity(EntitySpellSheet, this.giveUserSpell.pos.x, this.giveUserSpell.pos.y);
          }
          this.giveUserSpell = false;
        }
        if (this.deactivationTimer.delta() < 0) {
          this.currentAnim = this.anims.activated;
        } else {
          this.currentAnim = this.anims.idle;
        }
        this.parent();
      },
      getBody: function (){
        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.position = new Box2D.Common.Math.b2Vec2(
          (this.pos.x + this.size.x / 2) * Box2D.SCALE,
          (this.pos.y + this.size.y / 2) * Box2D.SCALE
        );
        bodyDef.type = 0;
        return bodyDef
      },
      getFixture: function () {
        var fixture = this.parent();
        fixture.isSensor = true;
        return fixture;
      }
    });

  });
