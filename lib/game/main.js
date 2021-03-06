ig.module(
  'game.main'
)
.requires(
  'plugins.splitscreen',

  'impact.game',
  'impact.font',

  'game.entities.player',
  'game.entities.statusEffect',
  'game.entities.spellSheet',
  'game.entities.crate',
  'game.levels.test2',

  'plugins.box2d.game',

  'plugins.gamepads'
)
.defines(function(){
  ig.Sound.use = [ig.Sound.FORMAT.OGG]
MyGame = ig.Box2DGame.extend({
  gravity: 0, // All entities are affected by this

  // Load a font
  font: new ig.Font( 'media/04b03.font.png' ),
  clearColor: '#1b2026',

  init: function() {
    Spells = [
      {
        "name": "Fire Ball",
        "icon": "spells/fireball.png",
        "damageBase": 1,
        "duration": 0,
        "entity": EntityFireball,
        "level": 1
      },
      {
        "name": "Laser Eyes",
        "icon": "spells/beam-light.png",
        "damageBase": .25,
        "duration": 2,
        "entity": EntityLaser,
        "level": 1
      },
      {
        "name": "Magic Missiles",
        "icon": "spells/needles.png",
        "damageBase": 42,
        "duration": 0,
        "expiration": 10,
        "entity": EntityAttackSteerable,
        "level": 1
      },
      {
        "name": "Bees!?",
        "icon": "spells/terror-1.png",
        "damageBase": 5,
        "duration": 0,
        "expiration": 2,
        "entity": EntityAttackHoming,
        "level": 1
      },
      {
        "name": "Impermeable Shield",
        "icon": "spells/protect-blue-1.png",
        "duration": 0,
        "expiration": 5,
        "stat": "armor",
        "target": "self",
        "powerTotal": 20,
        "entity": EntityStatusEffect,
        "level": 1
      },

      //{
      //  "name": "Curse Armor",
      //  "icon": "spells/protect-magenta-2.png",
      //  "armorReductionBase": 10,
      //  "duration": 0,
      //  "expiration": 20,
      //  "stat": "armor",
      //  "powerTotal": 25,
      //  "entity": EntityStatusEffect,
      //  "level": 1
      //},
      {
        "name": "Healing Prayer",
        "icon": "spells/heal-sky-3.png",
        "duration": 0,
        "expiration": -1,
        "stat": "health",
        "target": "self",
        "powerTotal": 25,
        "entity": EntityStatusEffect,
        "level": 1
      },
      //{
      //  "name": "Toughness",
      //  "icon": "spells/protect-red-2.png",
      //  "duration": 0,
      //  "expiration": 10,
      //  "stat": "health",
      //  "target": "self",
      //  "powerTotal": 40,
      //  "entity": EntityStatusEffect,
      //  "level": 1
      //},
      {
        "name": "Spell of Fast Walk",
        "icon": "spells/wings.png",
        "duration": 0,
        "expiration": 10,
        "stat": "speed",
        "target": "self",
        "powerTotal": 10,
        "entity": EntityStatusEffect,
        "level": 1
      },
    ];
    ig.music.add( 'media/sounds/intro.ogg' );
    ig.music.add( 'media/sounds/gameplay.ogg' );

    ig.music.volume = 0.5;
    ig.music.play();



    this.parent();

    var names = ['A', 'B'], name, pad;
    for (var i = 0, len = names.length; i < len; ++i) {
      name = names[i];
      pad = 'GAMEPAD' + (i + 1);

      ig.input.bind(ig[pad].LEFT_ANALOGUE_AXES_X, 'moveX_' + name);
      ig.input.bind(ig[pad].LEFT_ANALOGUE_AXES_Y, 'moveY_' + name);

      ig.input.bind(ig[pad].RIGHT_ANALOGUE_AXES_X, 'aimX_' + name);
      ig.input.bind(ig[pad].RIGHT_ANALOGUE_AXES_Y, 'aimY_' + name);

      ig.input.bind(ig[pad].FACE_3, 'left_action_' + name);
      ig.input.bind(ig[pad].FACE_2, 'right_action_' + name);
      ig.input.bind(ig[pad].FACE_4, 'up_action_' + name);
      ig.input.bind(ig[pad].FACE_1, 'down_action_' + name);

      ig.input.bind(ig[pad].PAD_LEFT, 'dpad_' + name + '_left');
      ig.input.bind(ig[pad].PAD_RIGHT, 'dpad_' + name + '_right');
      ig.input.bind(ig[pad].PAD_TOP, 'dpad_' + name + '_up');
      ig.input.bind(ig[pad].PAD_BOTTOM, 'dpad_' + name + '_down');

      ig.input.bind(ig[pad].RIGHT_SHOULDER_BOTTOM, 'use_' + name);

      ig.input.bind(ig[pad].TYPE, 'type_' + name);
    }


    // Load the LevelTest as required above ('game.level.test2')
    this.loadLevel( LevelTest2 );

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
    if (this.playerDeathComboA) {
    	this.playerDeathComboA.update();
    }
    if (this.playerDeathComboB) {
    	this.playerDeathComboB.update();
    }

    if (ig.music.currentIndex === 1) {
      ig.music.loop = true;
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
