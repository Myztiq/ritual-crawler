ig.module(
  'game.entities.death'
  )
  .requires(
    'impact.entity',
    'plugins.box2d.entity'
  )
  .defines(function () {

    EntityDeath = ig.Box2DEntity.extend({
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
        this.timer = new ig.Timer();
        this.timer.set( 5 );
        this.timer.pause();
      },

      update: function () {
        var dirX = this.target.pos.x - this.pos.x;
        var dirY = this.target.pos.y - this.pos.y;

        this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2(dirX, dirY), this.body.GetPosition() );

        this.parent();
        console.log('this.timer.delta()', this.timer && this.timer.delta());
        if (this.timer && this.timer.delta() > 0) {
          this.kill();
        }
      },

      collision: {group: 'spell', name: 'death', collidesWith: ['player']},
      onContact: function (initiator) {
        if (initiator !== this.caster) {
          this.timer.unpause();
          initiator.receiveDamage(1, this);
        }
      }
    });
  });
