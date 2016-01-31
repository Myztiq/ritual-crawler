ig.module(
  'game.entities.shrine'
  )
  .requires(
    'plugins.box2d.entity'
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
      },

      collision: {group: 'shrine', name: 'shrine', collidesWith: ['player']},
      onContact: function (initiator) {
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

        this.currentAnim = this.anims.activated;
        alert('YOU WON ' + initiator.playerName + '!!!!');
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
