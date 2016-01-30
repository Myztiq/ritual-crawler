ig.module(
  'game.entities.player'
)
.requires(
  'impact.entity',
  'game.entities.fireball',
  'plugins.box2d.entity'
)
.defines(function () {

EntityPlayer = ig.Box2DEntity.extend({
  size: {x: 8, y:14},
  offset: {x: 4, y: 2},
  health: 100,



	type: ig.Entity.TYPE.A,
  checkAgainst: ig.Entity.TYPE.NONE,
  collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

  animSheet: new ig.AnimationSheet( 'media/player.png', 16, 24 ),

  flip: false,

	inventory: [],
	knownSpells: [],

  init: function( x, y, settings ) {
    var self = this;
    this.parent( x, y, settings );
    this.keyMap = {
      LEFT: 'left_' + this.playerName,
      RIGHT: 'right_' + this.playerName,
      UP: 'up_' + this.playerName,
      DOWN: 'down_' + this.playerName,
      SHOOT1: 'shoot_' + this.playerName + '_1',
      SHOOT2: 'shoot_' + this.playerName + '_2',
      SHOOT3: 'shoot_' + this.playerName + '_3',
      SHOOT4: 'shoot_' + this.playerName + '_4',
      USE: 'use_' + this.playerName
    };


    // Add the animations
    this.addAnim( 'idle', 1, [0] );

    if(!ig.global.wm) {
      this.body.SetFixedRotation(true);
    }

    // use spell
    // TODO get from inventory
    var spell = {
      combo: ['UP', 'DOWN', 'LEFT', 'RIGHT'],
      time: 5
    };

    spell.combo = spell.combo.map(function (key) {
      return self.keyMap[key];
    });

    var handle = ig.game.comboManager.add(spell.combo, spell.time, function() {
      // uncomment when done
      // ig.game.comboManager.remove(handle);
      // NEED TO ADD EFFECT HERE
      ig.game.spawnEntity( EntitySpell, self.pos.x, self.pos.y, {
        spell: spell
      });
    });
  },

  update: function() {
    var self = this;
    var enemy = ig.game.getEntitiesByType('EntityPlayer').find(function (entity) {
      return entity.playerName !== self.playerName;
    });
    var screenIndex = this.playerName === 'A' ? 0 : 1;
    var screen = ig.game.screens[screenIndex];

    var xDifference = this.pos.x - screen.size.x / 2;
    var yDifference = this.pos.y - screen.size.y / 2;

    if (screen.camera.x > xDifference + 2 || screen.camera.x < xDifference - 2) {
      screen.camera.x = (9 * screen.camera.x + xDifference) / 10;
    } else {
      screen.camera.x = xDifference;
    }

    if (screen.camera.y > yDifference + 2 || screen.camera.y < yDifference - 2) {
      screen.camera.y = (9 * screen.camera.y + yDifference) / 10;
    } else {
      screen.camera.y = yDifference;
    }

    var currentVelocity = this.body.GetLinearVelocity();
    var targetVelocity = {x: 0, y: 0};

    if (ig.input.state(this.keyMap.LEFT)) {
      targetVelocity.x = -10;
    } else if (ig.input.state(this.keyMap.RIGHT)) {
      targetVelocity.x = 10;
    }

    if (ig.input.state(this.keyMap.UP)) {
      targetVelocity.y = -10;
    } else if (ig.input.state(this.keyMap.DOWN)) {
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
    if (ig.input.pressed(this.keyMap.SHOOT2)) {
      var x = this.pos.x + (this.flip ? -6 : 6 );
      var y = this.pos.y + 6;
      ig.game.spawnEntity(EntityProjectile, x, y, {flip: this.flip});
    }

    if (ig.input.pressed(this.keyMap.SHOOT1)) {
      if (enemy) {
        enemy.receiveDamage(10, this)
      }
    }

    if (ig.input.pressed(this.keyMap.SHOOT3)) {
      if (enemy) {
        ig.game.spawnEntity(EntityFireball, this.pos.x + 6, this.pos.y + 6, {
          target: enemy
        });
      }
    }

    // use scroll
    if (ig.input.pressed(this.keyMap.USE)) {
      // TODO get from inventory
      var scroll = {
        combo: ['LEFT', 'RIGHT'],
        time: 5
      };

      scroll.combo = scroll.combo.map(function (key) {
        return self.keyMap[key];
      });

      var handle = ig.game.comboManager.add(scroll.combo, scroll.time, function () {
        ig.game.comboManager.remove(handle);
        // NEED TO ADD EFFECT HERE
        ig.game.spawnEntity(EntitySpell, self.pos.x, self.pos.y);
      });
    }

    this.currentAnim.flip.x = this.flip;

    // move!
    this.parent();
    if (enemy) {
      var angleToEnemy = this.angleTo(enemy);
      var distanceToEnemy = this.distanceTo(enemy);

      if (!this.pointer) {
        this.pointer = ig.game.spawnEntity(EntityPointer, this.pos.x, this.pos.y);
      }

      var distancePercentage = distanceToEnemy / 400;
      if (distancePercentage > .1) {
        var actualDistance = 15;

        var xMovement = Math.cos(angleToEnemy) * actualDistance;
        var yMovement = Math.sin(angleToEnemy) * actualDistance;

        this.pointer.pos.x = this.pos.x + xMovement;
        this.pointer.pos.y = this.pos.y + this.size.y / 2 + yMovement;
        this.pointer.currentAnim.angle = angleToEnemy;
        this.pointer.currentAnim.alpha = distancePercentage - .1;
      } else {
        this.pointer.currentAnim.alpha = 0;
      }
    }
  },

  addToInventory: function (item) {
    this.inventory.push(item);
  },

  removeFromInventory: function (item) {
    var index = this.inventory.indexOf(item);
    this.inventory.remove(index);
  },

  addToSpellBook: function (spell) {
    this.knownSpells.push(spell)
  },


  collision: {group: 'player', name: 'player', collidesWith: ['item']},
  onContact: function (initiator) {

  },

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

EntitySpell = ig.Box2DEntity.extend({
  size: {x: 8, y: 4},

  type: ig.Entity.TYPE.NONE,
  checkAgainst: ig.Entity.TYPE.B,
  collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

  animSheet: new ig.AnimationSheet( 'media/crate.png', 8, 4 ),

  init: function( x, y, settings ) {
    this.parent( x, y, settings );

    this.addAnim( 'idle', 1, [0] );
    this.currentAnim.flip.x = settings.flip;

    var velocity = (settings.flip ? -10 : 10);
    this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2(velocity,0), this.body.GetPosition() );
  }
});

EntityPointer = ig.Entity.extend({
  size: {x: 8, y: 4},

  type: ig.Entity.TYPE.NONE,
  checkAgainst: ig.Entity.TYPE.NONE,
  collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

  animSheet: new ig.AnimationSheet( 'media/projectile.png', 8, 4 ),

  init: function( x, y, settings ) {
    this.parent( x, y, settings );
    this.addAnim( 'idle', 1, [0] );
  }
});

});
