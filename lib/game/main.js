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

  'plugins.gamepads',
  'plugins.comboManager'
)
.defines(function(){

MyGame = ig.Box2DGame.extend({
  gravity: 0, // All entities are affected by this

  // Load a font
  font: new ig.Font( 'media/04b03.font.png' ),
  clearColor: '#1b2026',

  init: function() {
    this.parent();

    ig.input.bind( ig.GAMEPAD1.LEFT_ANALOGUE_AXES_X, 'moveX_A');
    ig.input.bind( ig.GAMEPAD1.LEFT_ANALOGUE_AXES_Y, 'moveY_A');

    ig.input.bind( ig.GAMEPAD1.RIGHT_ANALOGUE_AXES_X, 'aimX_A');
    ig.input.bind( ig.GAMEPAD1.RIGHT_ANALOGUE_AXES_Y, 'aimY_A');

    // player A
    ig.input.bind( ig.GAMEPAD1.PAD_LEFT, 'left_A' );
    ig.input.bind( ig.GAMEPAD1.PAD_RIGHT, 'right_A' );
    ig.input.bind( ig.GAMEPAD1.PAD_TOP, 'up_A');
    ig.input.bind( ig.GAMEPAD1.PAD_BOTTOM, 'down_A');
    ig.input.bind( ig.GAMEPAD1.FACE_1, 'shoot_A_1');
    ig.input.bind( ig.GAMEPAD1.FACE_2, 'shoot_A_2');
    ig.input.bind( ig.GAMEPAD1.FACE_3, 'shoot_A_3');
    ig.input.bind( ig.GAMEPAD1.FACE_4, 'shoot_A_4');

    ig.input.bind( ig.KEY.LEFT_ARROW, 'left_A' );
    ig.input.bind( ig.KEY.RIGHT_ARROW, 'right_A' );
    ig.input.bind( ig.KEY.UP_ARROW, 'up_A' );
    ig.input.bind( ig.KEY.DOWN_ARROW, 'down_A' );

    ig.input.bind( ig.KEY.N, 'shoot_A' );
    ig.input.bind( ig.KEY.M, 'use_A' );


    // player b
    ig.input.bind( ig.GAMEPAD2.LEFT_ANALOGUE_AXES_X, 'moveX_B');
    ig.input.bind( ig.GAMEPAD2.LEFT_ANALOGUE_AXES_Y, 'moveY_B');

    ig.input.bind( ig.GAMEPAD2.RIGHT_ANALOGUE_AXES_X, 'aimX_B');
    ig.input.bind( ig.GAMEPAD2.RIGHT_ANALOGUE_AXES_Y, 'aimY_B');

    ig.input.bind( ig.GAMEPAD2.PAD_LEFT, 'left_B' );
    ig.input.bind( ig.GAMEPAD2.PAD_RIGHT, 'right_B' );
    ig.input.bind( ig.GAMEPAD2.PAD_TOP, 'up_B');
    ig.input.bind( ig.GAMEPAD2.PAD_BOTTOM, 'down_B');
    ig.input.bind( ig.GAMEPAD2.FACE_1, 'shoot_B_1');
    ig.input.bind( ig.GAMEPAD2.FACE_2, 'shoot_B_2');
    ig.input.bind( ig.GAMEPAD2.FACE_3, 'shoot_B_3');
    ig.input.bind( ig.GAMEPAD2.FACE_4, 'shoot_B_4');

    ig.input.bind( ig.KEY.A, 'left_B' );
    ig.input.bind( ig.KEY.D, 'right_B' );
    ig.input.bind( ig.KEY.W, 'up_B' );
    ig.input.bind( ig.KEY.S, 'down_B' );

    ig.input.bind( ig.KEY.Q, 'shoot_B' );
    ig.input.bind( ig.KEY.E, 'use_B' );

    this.comboManager = new ComboManager();

    // Load the LevelTest as required above ('game.level.test')
    this.loadLevel( LevelTest );

		Spells = [
			{name: 'Fire Ball', damageBase: 1, rangeBase: 10, type: 'offensive', level: 1, target: 'self', icon: 'fireball.png'},
		]

    window.controllerType = 'ps'; //Set the conroller type for game ['ps', 'xbox']

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

    this.comboManager.update();

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

// Canvas Dimension Multiplier
var m = 3;
ig.main('#canvas', MyGame, 60, 320*m, 240*m, 1);
});
