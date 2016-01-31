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

      animSheet: new ig.AnimationSheet('media/tiles.png', 32, 32),

      init: function (x, y, settings) {
        this.icon = 'default.png';
        this.addAnim('idle', 1, [15]);
        this.addAnim('activated', 1, [18]);

        this.parent(x, y, settings);
        this.timer = new ig.Timer();
        if (settings && settings.velocity) {
          this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2(settings.velocity.x, settings.velocity.y), this.body.GetPosition() );
        }
      },

      collision: {group: 'shrine', name: 'shrine', collidesWith: ['player']},
      onContact: function (initiator) {
        var allSkulls = true;
        Object.keys(initiator.inventory).forEach(function (key) {
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
      },
      getBody: function (){
        var body = this.parent();
        body.linearDamping = 5;
        body.angularDamping = 5;
        return body;
      }
    });

  });
