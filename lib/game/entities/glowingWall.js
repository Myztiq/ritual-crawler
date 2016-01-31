ig.module(
  'game.entities.glowingWall'
  )
  .requires(
    'plugins.box2d.entity',
    'game.entities.spellSheet'
  )
  .defines(function () {

    EntityGlowingWall = ig.Box2DEntity.extend({

      size: {x: 32, y: 32},
      killme: false,

      type: ig.Entity.TYPE.B,
      checkAgainst: ig.Entity.TYPE.A,
      collides: ig.Entity.COLLIDES.PASSIVE,

      animSheet: new ig.AnimationSheet('media/torch_anim.png', 64, 64),
      zIndex: -1,

      init: function (x, y, settings) {
        this.addAnim('idle',.2, [0,1,2,3,4]);
        this.parent(x, y, settings);
      },
      getBody: function (){
        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.position = new Box2D.Common.Math.b2Vec2(
          (this.pos.x + this.size.x / 2) * Box2D.SCALE,
          (this.pos.y + this.size.y / 2) * Box2D.SCALE
        );
        bodyDef.type = 0;
        return bodyDef
      },
      getFixture: function () {
        var fixture = this.parent();
        fixture.isSensor = true;
        return fixture;
      }
    });

  });
