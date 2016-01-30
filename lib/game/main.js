ig.module( 
  'game.main'
)
.requires(
  'impact.game',
  'impact.font',

  'game.entities.player',
  'game.entities.crate',
  'game.levels.test',

  'plugins.box2d.game'
)
.defines(function(){

MyGame = ig.Box2DGame.extend({

  gravity: 100, // All entities are affected by this

  // Load a font
  font: new ig.Font( 'media/04b03.font.png' ),
  clearColor: '#1b2026',

  init: function() {
    // Bind keys
    ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
    ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
    ig.input.bind( ig.KEY.X, 'jump' );
    ig.input.bind( ig.KEY.C, 'shoot' );

    if( ig.ua.mobile ) {
      ig.input.bindTouch( '#buttonLeft', 'left' );
      ig.input.bindTouch( '#buttonRight', 'right' );
      ig.input.bindTouch( '#buttonShoot', 'shoot' );
      ig.input.bindTouch( '#buttonJump', 'jump' );
    }

    // Load the LevelTest as required above ('game.level.test')
    this.loadLevel( LevelTest );

		Spells = [
			{name: 'Magic Missle', damageBase: 1, rangeBase: 10, type: 'arcane', level: 1, target: 'self'},
			{name: 'Shield', defenseBase: 1, rangeBase: 1, type: 'arcane', level: 1, target: 'other'}
		]
  },

  loadLevel: function( data ) {
    this.parent( data );
    for( var i = 0; i < this.backgroundMaps.length; i++ ) {
      this.backgroundMaps[i].preRender = true;
    }

		listener = new Box2D.Dynamics.b2ContactListener;
		listener.BeginContact = function(contact) {

			var fixtureA = contact.GetFixtureA().m_userData;
			var fixtureB = contact.GetFixtureB().m_userData;

			if (!(fixtureA && fixtureB) || !(fixtureA.collision && fixtureB.collision)) {
				return;
			}

      var contactA_collidesWith = fixtureA.collision.collidesWith;
			var contactA_group = fixtureA.collision.group;

      var contactB_collidesWith = fixtureB.collision.collidesWith;
			var contactB_group = fixtureB.collision.group;

			if (contactA_collidesWith.includes(contactB_group) || contactB_collidesWith.includes(contactA_group) ) {
				fixtureA.onContact(fixtureB);
				fixtureB.onContact(fixtureA);
			}
		}
		listener.EndContact = function(contact) {

		}
		listener.PostSolve = function(contact, impulse) {

		}
		listener.PreSolve = function(contact, oldManifold) {

		}
		ig.world.SetContactListener(listener);
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

    if( !ig.ua.mobile ) {
      this.font.draw( 'Arrow Keys, X, C', 2, 2 );
    }
  }
});


if( ig.ua.iPad ) {
  ig.Sound.enabled = false;
  ig.main('#canvas', MyGame, 60, 240, 160, 2);
}
else if( ig.ua.mobile ) {
  ig.Sound.enabled = false;
  ig.main('#canvas', MyGame, 60, 160, 160, 2);
}
else {
  ig.main('#canvas', MyGame, 60, 320, 240, 2);
}

});
