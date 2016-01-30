ig.module(
  'game.entities.player'
)
.requires(
  'impact.entity',
  'plugins.box2d.entity'
)
.defines(function(){

EntityPlayer = ig.Box2DEntity.extend({
  size: {x: 8, y:14},
  offset: {x: 4, y: 2},

  type: ig.Entity.TYPE.A,
  checkAgainst: ig.Entity.TYPE.NONE,
  collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

  animSheet: new ig.AnimationSheet( 'media/player.png', 16, 24 ),

  flip: false,

  init: function( x, y, settings ) {
    this.parent( x, y, settings );

    // Add the animations
    this.addAnim( 'idle', 1, [0] );
    this.addAnim( 'jump', 0.07, [1,2] );

    if(!ig.global.wm) {
      this.body.SetFixedRotation(true);
    }
  },

  update: function() {
    var screenIndex = this.playerName === 'A' ? 0 : 1;
    var screen = ig.game.screens[screenIndex];

    var xDifference = this.pos.x - screen.size.x/2;
    var yDifference = this.pos.y - screen.size.y/2;

    if (screen.camera.x > xDifference + 2 || screen.camera.x < xDifference - 2) {
      screen.camera.x = (9*screen.camera.x + xDifference)/10;
    } else {
      screen.camera.x = xDifference;
    }

    if (screen.camera.y > yDifference + 2 || screen.camera.y < yDifference - 2) {
      screen.camera.y = (9*screen.camera.y + yDifference)/10;
    } else {
      screen.camera.y = yDifference
    }

    var currentVelocity = this.body.GetLinearVelocity();
    var targetVelocity = { x: 0, y: 0 };

    if (ig.input.state('left')) {
      targetVelocity.x = -10;
    } else if (ig.input.state('right')) {
      targetVelocity.x = 10;
    }

    if (ig.input.state('up')) {
      targetVelocity.y = -10;
    } else if (ig.input.state('down')) {
      targetVelocity.y = 10;
    }

    var dx = targetVelocity.x - currentVelocity.x;
    var dy = targetVelocity.y - currentVelocity.y;

    var mass = this.body.GetMass();
    var impulse = {
      x: mass * dx,
      y: mass * dy
    };
    var vec2 = new Box2D.Common.Math.b2Vec2(impulse.x, impulse.y);
    this.body.ApplyImpulse(vec2, this.body.GetWorldCenter());

    // shoot
    if( ig.input.pressed('shoot') ) {
      var x = this.pos.x + (this.flip ? -6 : 6 );
      var y = this.pos.y + 6;
      ig.game.spawnEntity( EntityProjectile, x, y, {flip:this.flip} );
    }

    this.currentAnim.flip.x = this.flip;

    // move!
    this.parent();
  }
});


EntityProjectile = ig.Box2DEntity.extend({
  size: {x: 8, y: 4},

  type: ig.Entity.TYPE.NONE,
  checkAgainst: ig.Entity.TYPE.B,
  collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

  animSheet: new ig.AnimationSheet( 'media/projectile.png', 8, 4 ),

  init: function( x, y, settings ) {
    this.parent( x, y, settings );

    this.addAnim( 'idle', 1, [0] );
    this.currentAnim.flip.x = settings.flip;

    var velocity = (settings.flip ? -10 : 10);
    this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2(velocity,0), this.body.GetPosition() );
  }
});

});
