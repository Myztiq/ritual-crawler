ig.module(
  'game.entities.homing'
  )
  .requires(
    'impact.entity',
    'plugins.box2d.entity'
  )
  .defines(function () {

    EntityAttackHoming = ig.Box2DEntity.extend({
      size: {x: 32, y: 32},

      type: ig.Entity.TYPE.B,
      checkAgainst: ig.Entity.TYPE.A,
      collides: ig.Entity.COLLIDES.PASSIVE,

      animSheet: new ig.AnimationSheet('media/beezzzzz.png', 32, 32),

      init: function (x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('idle',.2, [0,1,2,3]);

        this.caster = settings.caster;
        this.target = settings.target;
        this.spell = settings.spell;

        if (!this.target) {
          this.kill()
          return;
        }
        var initialAngle = Math.atan2(this.target.pos.y - y, this.target.pos.x - x) + Math.PI / 2;

        if (!settings.spawningChild) {
          initialAngle += Math.PI;
          ig.game.spawnEntity(EntityAttackHoming, x, y, Object.assign({}, settings, {
            spawningChild: true
          }));
        }

        var dx = Math.cos(initialAngle) * 200;
        var dy = Math.sin(initialAngle) * 200;
        this.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(dx, dy), this.body.GetPosition());

        this.timer = new ig.Timer();
        this.timer.set( this.spell.expiration );
      },

      update: function () {
        if (!this.target) { return; }
        var angularVel = this.body.GetLinearVelocity()
        this.body.SetAngle(Math.atan2(angularVel.y, angularVel.x) + 3.14159)

        var dirX = this.target.pos.x - this.pos.x;
        var dirY = this.target.pos.y - this.pos.y;

        var length = Math.sqrt(dirX * dirX + dirY * dirY);
        dirX /= (length / 10);
        dirY /= (length / 10);

        this.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(dirX, dirY), this.body.GetPosition());

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

      collision: {group: 'spell', name: 'homing', collidesWith: ['player']},

      onContact: function (thingHit) {
        if (thingHit && this.caster && thingHit !== this.caster) {
          this.timer.unpause();
          thingHit.receiveDamage(this.spell.damageBase, this);
        }
      }
    });
  });
