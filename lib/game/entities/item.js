ig.module(
  'game.entities.item'
  )
  .requires(
    'plugins.box2d.entity'
  )
  .defines(function () {

    EntityItem = ig.Box2DEntity.extend({

      size: {x: 32, y: 32},
      killme: false,

      type: ig.Entity.TYPE.B,
      checkAgainst: ig.Entity.TYPE.A,
      collides: ig.Entity.COLLIDES.PASSIVE,

      animSheet: new ig.AnimationSheet('media/basic_leggings.png', 32, 32),

      init: function (x, y, settings) {
        this.icon = 'default.png';
        this.addAnim('idle', 1, [0]);
        this.parent(x, y, settings);
        this.timer = new ig.Timer();
        this.timer.set( .5 );
        if (settings && settings.velocity) {
          this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2(settings.velocity.x, settings.velocity.y), this.body.GetPosition() );
        }
      },

      collision: {group: 'item', name: 'item', collidesWith: ['player']},
      onContact: function (initiator) {

        if (this.timer.delta() < 0) {
          return;
        }
        if (initiator.hasInventoryRoom()) {
          this.kill();
          initiator.addToInventory({
            icon: this.icon,
            type: this.type,
            sprite: this.currentAnim
          });
        }
      },
      
      getFixture: function () {
        var fixture = new Box2D.Dynamics.b2FixtureDef;
        fixture.shape = new Box2D.Collision.Shapes.b2CircleShape(this.size.x / 2 * Box2D.SCALE);
        fixture.density = 1.0;
        fixture.restitution = 1;
        fixture.userData = this;

        fixture.filter.categoryBits = 0x1000;

        return fixture;
      },
      
      getBody: function (){
        var body = this.parent();
        body.linearDamping = 5;
        body.angularDamping = 5;
        return body;
      }
    });

  });
