ig.module(
  'plugins.box2d.entity'
)
.requires(
  'impact.entity',
  'plugins.box2d.game'
)
.defines(function(){


ig.Box2DEntity = ig.Entity.extend({
  body: null,
  angle: 0,
  killme: false,

  init: function( x, y , settings ) {
    this.parent( x, y, settings );

    // Only create a box2d body when we are not in Weltmeister
    if( !ig.global.wm ) {
      this.createBody();
    }
  },

  createBody: function() {
    // fixture.friction = 0.5;
    // fixture.restitution = 0.3;
    this.body = ig.world.CreateBody(this.getBody());
    if (this.body) {
      this.body.CreateFixture(this.getFixture());
    }
  },

  getBody: function () {
    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.position = new Box2D.Common.Math.b2Vec2(
      (this.pos.x + this.size.x / 2) * Box2D.SCALE,
      (this.pos.y + this.size.y / 2) * Box2D.SCALE
    );
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    return bodyDef
  },

  getFixture: function () {
    var fixture = new Box2D.Dynamics.b2FixtureDef;
    fixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    fixture.shape.SetAsBox(
      this.size.x / 2 * Box2D.SCALE,
      this.size.y / 2 * Box2D.SCALE
    );

    fixture.userData = this;
    fixture.density = 1.0;
    return fixture
  },

  update: function() {
    if (this.killme) {
      this.kill();
      this.parent();
      return;
    }
    var p = this.body.GetPosition();
    this.pos = {
      x: (p.x / Box2D.SCALE - this.size.x / 2),
      y: (p.y / Box2D.SCALE - this.size.y / 2 )
    };
    this.angle = this.body.GetAngle().round(2);

    if( this.currentAnim ) {
      this.currentAnim.update();
      this.currentAnim.angle = this.angle;
    }
    this.parent();
  },

  kill: function() {
    if (!this.killme) {
      this.killme = true;
      return;
    }
    // If i dont work, call me from update.
    ig.world.DestroyBody( this.body );
    this.parent();
  }
});

});
