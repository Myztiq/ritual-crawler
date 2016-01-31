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
        this.target = settings.target;

        this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2(settings.velocity.x, settings.velocity.y), this.body.GetPosition() );

        var velocityAngle = Math.atan2(settings.velocity.y, settings.velocity.x)
        var radius = 10;

        var xMovement = Math.cos(velocityAngle) * radius;
        var yMovement = Math.sin(velocityAngle) * radius;

        this.pos.x += xMovement;
        this.pos.y += yMovement;

        if (!settings.spawningChild) {
          var velocityModifier = 3;
          var rotatedVelocityAngle = velocityAngle + 1.5708;
          var total = 6;
          [1,2,3,4].forEach((i) => {
            // console.log(i)
            var customSettings = {};
            Object.keys(settings).forEach(function (key) {
              customSettings[key] = settings[key];
            });
            customSettings.velocity = {};
            customSettings.spawningChild = true;
            customSettings.velocity.x = settings.velocity.x;
            customSettings.velocity.y = settings.velocity.y;

            customSettings.velocity.x *= velocityModifier;
            customSettings.velocity.y *= velocityModifier;

            customSettings.velocity.x += (i-(total/2)) * 30;
            customSettings.velocity.y += (i-(total/2)) * 30;

            // console.log('New velocity', customSettings.velocity);

            var distanceAway = (i-(total/5)) * this.size.y/2;
            var translationX = Math.cos(rotatedVelocityAngle) * distanceAway;
            var translationY = Math.sin(rotatedVelocityAngle) * distanceAway;
            ig.game.spawnEntity(EntityFireball, this.pos.x + translationX, this.pos.y + translationY, customSettings);
          });
          this.kill()
        }

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
