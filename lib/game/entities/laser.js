ig.module(
  'game.entities.laser'
  )
  .requires(
    'impact.entity',
    'plugins.box2d.entity'
  )
  .defines(function () {

    EntityLaser = ig.Box2DEntity.extend({
      size: {x: 2, y: 2},

      type: ig.Entity.TYPE.B,
      checkAgainst: ig.Entity.TYPE.A,
      collides: ig.Entity.COLLIDES.PASSIVE,

      // http://opengameart.org/content/simple-fireball
      animSheet: new ig.AnimationSheet('media/laser.png', 2, 2),

      init: function (x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('fire', 1, [0]);
        this.caster = settings.caster;

        this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2(1, 1), this.body.GetPosition() );
        this.timer = new ig.Timer();
        this.timer.set( .5 );
      },
      update: function () {
        this.currentAnim.alpha = -this.timer.delta()/.5;
        this.parent();
        if (this.timer.delta() > 0) {
          this.currentAnim.alpha = 0;
          this.kill();
        }
      },

      collision: {group: 'spell', name: 'laser', collidesWith: ['player']},
      onContact: function (initiator) {
        if (initiator !== this.caster) {
          this.kill();
          initiator.receiveDamage(1, this);
        }
      },

      getFixture: function () {
        var fixture = new Box2D.Dynamics.b2FixtureDef;
        fixture.shape = new Box2D.Collision.Shapes.b2CircleShape(this.size.x / 2 * Box2D.SCALE);
        fixture.density = 1.0;
        fixture.restitution = 1;
        fixture.userData = this;
        fixture.filter.categoryBits = 2;
        fixture.filter.maskBits = 1;
        return fixture;
      }
    });
  });
