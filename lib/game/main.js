ig.module(
  'game.main'
)
.requires(
  'plugins.splitscreen',

  'impact.game',
  'impact.font',

  'game.entities.player',
  'game.entities.crate',
  'game.levels.test',

  'plugins.box2d.game',
  'plugins.gamepads'
)
.defines(function(){

MyGame = ig.Box2DGame.extend({

  gravity: 0, // All entities are affected by this

  // Load a font
  font: new ig.Font( 'media/04b03.font.png' ),
  clearColor: '#1b2026',

  init: function() {
    this.parent();

    ig.input.bind( ig.GAMEPAD1.PAD_LEFT, 'left' );
    ig.input.bind( ig.GAMEPAD1.PAD_RIGHT, 'right' );
    ig.input.bind( ig.GAMEPAD1.PAD_TOP, 'up');
    ig.input.bind( ig.GAMEPAD1.PAD_BOTTOM, 'down');
    ig.input.bind( ig.GAMEPAD1.FACE_2, 'shoot');

    // Bind keys
    ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
    ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
    ig.input.bind( ig.KEY.UP_ARROW, 'up');
    ig.input.bind( ig.KEY.DOWN_ARROW, 'down');
    ig.input.bind( ig.KEY.C, 'shoot' );

    // Load the LevelTest as required above ('game.level.test')
    this.loadLevel( LevelTest );
  },

  loadLevel: function( data ) {
    this.parent( data );
    for( var i = 0; i < this.backgroundMaps.length; i++ ) {
      this.backgroundMaps[i].preRender = true;
    }
  },

  update: function() {
    // Update all entities and BackgroundMaps
    this.parent();

    // screen follows the player
    var player = this.getEntitiesByType( EntityPlayer )[0];
    if( player ) {
      this.screen.x = player.pos.x - ig.system.width/2;
      this.screen.y = player.pos.y - ig.system.height/2;
    }
  },

  draw: function() {
    // Draw all entities and BackgroundMaps
    this.parent();
  }
});

ig.main('#canvas', MyGame, 60, 320, 240, 2);

});
