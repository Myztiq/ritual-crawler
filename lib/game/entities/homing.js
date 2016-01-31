ig.module(
  'game.entities.homing'
  )
  .requires(
    'impact.entity',
    'plugins.box2d.entity'
  )
  .defines(function () {

    EntityAttackHoming = ig.Box2DEntity.extend({
      size: {x: 8, y: 4},

      type: ig.Entity.TYPE.B,
      checkAgainst: ig.Entity.TYPE.A,
      collides: ig.Entity.COLLIDES.PASSIVE,

      animSheet: new ig.AnimationSheet('media/crate.png', 8, 4),

      init: function (x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('idle', 1, [0]);
        this.caster = settings.caster;
        this.target = settings.target;
        this.spell = settings.spell;

        console.log(settings.spell, 'AWDSF')
        this.timer = new ig.Timer();
        this.timer.set( this.spell.expiration );
        this.timer.pause();
      },

      update: function () {
        if (!this.target) { return; }
        var dirX = this.target.pos.x - this.pos.x;
        var dirY = this.target.pos.y - this.pos.y;

        this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2(dirX * .1, dirY * .1), this.body.GetPosition() );

        this.parent();

        if (this.timer && this.timer.delta() > 0) {
          this.kill();
        }
      },

      collision: {group: 'spell', name: 'homing', collidesWith: ['player']},

      onContact: function (thingHit) {
        if (thingHit && this.caster && thingHit !== this.caster) {
          this.timer.unpause();
          thingHit.receiveDamage(this.spell.damageBase, this);

          // move out
          var dirX = (this.target.pos.x - this.pos.x) * .5;
          var dirY = (this.target.pos.y - this.pos.y) * .5;
          this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2(-dirX, -dirY), this.body.GetPosition() );
        }
      }
    });
  });
