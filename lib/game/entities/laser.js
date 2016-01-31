ig.module(
  'game.entities.laser'
  )
  .requires(
    'impact.entity',
    'plugins.box2d.entity'
  )
  .defines(function () {

    EntityLaser = ig.Box2DEntity.extend({
      size: {x: 16, y: 4},

      type: ig.Entity.TYPE.B,
      checkAgainst: ig.Entity.TYPE.A,
      collides: ig.Entity.COLLIDES.PASSIVE,

      // http://opengameart.org/content/simple-fireball
      animSheet: new ig.AnimationSheet('media/laser.png', 16, 4),

      init: function (x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('fire', 1, [0]);
        this.caster = settings.caster;
        this.target = settings.target;

        this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2(settings.velocity.x, settings.velocity.y), this.body.GetPosition() );

        var velocityAngle = Math.atan2(settings.velocity.y, settings.velocity.x)
        var radius = 10;

        var xMovement = Math.cos(velocityAngle) * radius;
        var yMovement = Math.sin(velocityAngle) * radius;


        this.pos.x += xMovement;
        this.pos.y += yMovement;

        if (!settings.spawningChild) {
          settings.spawningChild = true;

          var velocityModifier = 3;
          settings.velocity.x *= velocityModifier;
          settings.velocity.y *= velocityModifier;

          var rotatedVelocityAngle = velocityAngle + 1.5708;
          var total = 5;

          for (var i=0; i < total; i++) {
            var distanceAway = (i-(total/5)) * this.size.y/2;
            var translationX = Math.cos(rotatedVelocityAngle) * distanceAway;
            var translationY = Math.sin(rotatedVelocityAngle) * distanceAway;
            ig.game.spawnEntity(EntityLaser, this.pos.x + translationX, this.pos.y + translationY, settings);
          }
          this.kill()
        }

        this.timer = new ig.Timer();
        this.timer.set( .7 );
      },
      update: function () {
        var angularVel = this.body.GetLinearVelocity()
        this.body.SetAngle(Math.atan2(angularVel.y, angularVel.x))
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
        if (this.caster.playerName === 'A') {
          fixture.filter.maskBits = 0x0F0F;
        } else {
          fixture.filter.maskBits = 0x00FF;
        }
        fixture.filter.categoryBits = 0x1000;
        return fixture;
      }
    });
  });
