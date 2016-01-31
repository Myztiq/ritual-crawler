ig.module(
  'game.entities.steerable'
  )
  .requires(
    'impact.entity',
    'plugins.box2d.entity'
  )
  .defines(function () {

    EntityAttackSteerable = ig.Box2DEntity.extend({
      size: {x: 47, y: 13},
      offset: {x: 4, y: 8},

      type: ig.Entity.TYPE.B,
      checkAgainst: ig.Entity.TYPE.A,
      collides: ig.Entity.COLLIDES.PASSIVE,

      animSheet: new ig.AnimationSheet('media/sheeps.png', 123, 50),

      init: function (x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('idle',.2, [0,1,2,3]);

        this.caster = settings.caster;
        this.target = settings.target;
        this.spell = settings.spell;

        this.timer = new ig.Timer();
        this.timer.set( this.spell.expiration );
        this.timer.pause();
      },

      update: function () {
        if (!this.target) { return; }

        var angularVel = this.body.GetLinearVelocity();
        this.body.SetAngle(Math.atan2(angularVel.y, angularVel.x) + Math.PI);

        var dirX = this.target.pos.x - this.pos.x - (this.size.x / 2);
        var dirY = this.target.pos.y - this.pos.y - (this.size.y / 2);

        if(this.timer.delta() == -5 || this.timer.delta() == 0) {
          var length = Math.sqrt(dirX * dirX + dirY * dirY);
    			dirX /= (length / 10);
    			dirY /= (length / 10);
    		}

        this.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(dirX, dirY), this.body.GetPosition() );

        this.parent();

        if (this.timer && this.timer.delta() > 0) {
          this.kill();
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
      },

      collision: {group: 'spell', name: 'steerable', collidesWith: ['player']},

      onContact: function (thingHit) {
        if (thingHit && this.caster && thingHit !== this.caster) {
          this.timer.unpause();
          thingHit.receiveDamage(this.spell.damageBase, this);
        }
      }
    });
  });