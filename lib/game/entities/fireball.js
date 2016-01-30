ig.module(
  'game.entities.fireball'
  )
  .requires(
    'impact.entity',
    'plugins.box2d.entity'
  )
  .defines(function () {

    EntityFireball = ig.Box2DEntity.extend({
      size: {x: 20, y: 20},

      type: ig.Entity.TYPE.B,
      checkAgainst: ig.Entity.TYPE.A,
      collides: ig.Entity.COLLIDES.PASSIVE,

      // http://opengameart.org/content/simple-fireball
      animSheet: new ig.AnimationSheet('media/fireball.png', 32, 32),

      init: function (x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('fire', .1, [0, 1, 2, 3]);
        this.caster = settings.caster;

        this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2(50, -20), this.body.GetPosition() );
        this.timer = new ig.Timer();
        this.timer.set( 5 );
      },
      update: function () {
        var angularVel = this.body.GetLinearVelocity()
        this.body.SetAngle(Math.atan2(angularVel.y, angularVel.x))
        this.parent();
        if (this.timer.delta() > 0) {
          this.kill();
        }
      },

      collision: {group: 'spell', name: 'fireball', collidesWith: ['player']},
      onContact: function (initiator) {
        if (initiator !== this.caster) {
          this.kill();
          initiator.receiveDamage(10, this);
        }
      },

      getFixture: function () {
        var fixture = new Box2D.Dynamics.b2FixtureDef;
        fixture.shape = new Box2D.Collision.Shapes.b2CircleShape(this.size.x / 2 * Box2D.SCALE);
        fixture.density = 1.0;
        fixture.restitution = 1;
        fixture.userData = this;
        return fixture;
      }
    });
  });
