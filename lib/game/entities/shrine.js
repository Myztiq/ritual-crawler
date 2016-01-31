ig.module(
  'game.entities.shrine'
  )
  .requires(
    'plugins.box2d.entity',
    'game.entities.spellSheet'
  )
  .defines(function () {

    EntityShrine = ig.Box2DEntity.extend({

      size: {x: 64, y: 64},
      killme: false,

      type: ig.Entity.TYPE.B,
      checkAgainst: ig.Entity.TYPE.A,
      collides: ig.Entity.COLLIDES.PASSIVE,

      animSheet: new ig.AnimationSheet('media/set_dressing.png', 64, 64),
      zIndex: -1,
      win: new ig.Sound( 'media/sounds/victory.ogg' ),

      init: function (x, y, settings) {
        if (settings.finalShrine) {
          this.animSheet = new ig.AnimationSheet('media/set_dressing.png', 64, 128);
          this.addAnim('idle', 1, [8]);
          this.addAnim('activated', 1, [9]);
        } else {
          var labelMap = {
            1: 2,
            2: 3,
            3: 10,
            4: 11
          }
          this.addAnim('idle', 1, [labelMap[settings.label]]);
          this.addAnim('activated', 1, [labelMap[settings.label]]);
          this.anims.activated.opacity = .4;
        }
        this.icon = 'default.png';

        this.parent(x, y, settings);
        this.timer = new ig.Timer();
        this.deactivationTimer = new ig.Timer();
      },

      collision: {group: 'shrine', name: 'shrine', collidesWith: ['player']},
      onContact: function (initiator) {
        var self = this;
        if (this.finalShrine) {
          var skullCount = Object.keys(initiator.inventory).filter(function (key) {
            if (!initiator.inventory[key]) {
              return false;
            }
            return initiator.inventory[key].type === 'skull'
          }).length;
          if (skullCount < 2) {
            return;
          }

          ig.music.stop();
          this.win.play();


          alert('YOU WON ' + initiator.playerName + '!!!!');
          this.currentAnim = this.anims.activated;
          self.deactivationTimer.set(9999999);
        } else {
          if (this.deactivationTimer.delta() > 0) {
            Object.keys(initiator.inventory).find(function (key) {
              if (!initiator.inventory[key]) {
                return false;
              }
              if (initiator.inventory[key].type !== 'skull') {
                self.deactivationTimer.set(5);
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
