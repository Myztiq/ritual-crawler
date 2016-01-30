ig.module(
  'game.entities.player'
)
.requires(
  'impact.entity',
  'game.entities.fireball',
  'game.entities.laser',
  'plugins.box2d.entity'
)
.defines(function () {
  EntityPlayer = ig.Box2DEntity.extend({
    size: {x: 16, y: 32},
    offset: {x: 0, y: 0},
    health: 100,
    maxHealth: 100,

    maxVelocity: 10,
    aim: {x: 0, y: 0},

    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

    animSheet: new ig.AnimationSheet('media/player-udlr-3f-32x64.png', 32, 64),

    flip: false,

    inventory: [],
    knownSpells: [],

    init: function (x, y, settings) {
      var self = this;
      this.parent(x, y, settings);
      this.inventory = [];
      this.keyMap = {
        MOVE_X: 'moveX_' + this.playerName,
        MOVE_Y: 'moveY_' + this.playerName,

        AIM_X: 'aimX_' + this.playerName,
        AIM_Y: 'aimY_' + this.playerName,

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
      this.addAnim('idle', 1, [0]);
      this.addAnim('walkRight', 0.2, [1,2,3]);
      this.addAnim('walkUp', 0.2, [4,5,6]);
      this.addAnim('walkLeft', 0.2, [7,8,9]);
      this.addAnim('walkDown', 0.2, [10,11,12]);

      if (!ig.global.wm) {
        this.body.SetFixedRotation(true);
      }
    },

    draw: function () {
      // border/background
      ig.system.context.fillStyle = "rgb(255,0,0)";
      ig.system.context.beginPath();
      ig.system.context.rect(
        (this.pos.x - (this.size.x / 2) - ig.game.screen.x) * ig.system.scale,
        (this.pos.y - ig.game.screen.y - 8) * ig.system.scale,
        this.size.x * ig.system.scale * 3 - 8,
        4 * ig.system.scale
      );
      ig.system.context.closePath();
      ig.system.context.fill();

      // health bar
      ig.system.context.fillStyle = "rgb(0,0,0)";
      ig.system.context.beginPath();
      ig.system.context.rect(
        (this.pos.x - (this.size.x / 2) - ig.game.screen.x + 1) * ig.system.scale,
        (this.pos.y - ig.game.screen.y - 7) * ig.system.scale,
        ((this.size.x - 2) * (this.health / this.maxHealth)) * ig.system.scale * 3,
        2 * ig.system.scale
      );
      ig.system.context.closePath();
      ig.system.context.fill();

      this.parent();
    },

    update: function () {
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

      if (ig.input.state(this.keyMap.MOVE_X)) {
        // console.log('move x', ig.input.state(this.keyMap.MOVE_X));
        targetVelocity.x = ig.input.state(this.keyMap.MOVE_X) * this.maxVelocity;
      }

      if (ig.input.state(this.keyMap.MOVE_Y)) {
        // console.log('move y', ig.input.state(this.keyMap.MOVE_Y));
        targetVelocity.y = ig.input.state(this.keyMap.MOVE_Y) * this.maxVelocity;
      }

      if (ig.input.state(this.keyMap.AIM_X)) {
        // console.log('aim x', ig.input.state(this.keyMap.AIM_X));
        this.aim.x = ig.input.state(this.keyMap.AIM_X);
      }

      if (ig.input.state(this.keyMap.AIM_Y)) {
        // console.log('aim y', ig.input.state(this.keyMap.AIM_Y));
        this.aim.y = ig.input.state(this.keyMap.AIM_Y);
      }

      // if (ig.input.state(this.keyMap.LEFT)) {
      //   targetVelocity.x = -10;
      // } else if (ig.input.state(this.keyMap.RIGHT)) {
      //   targetVelocity.x = 10;
      // }

      // if (ig.input.state(this.keyMap.UP)) {
      //   targetVelocity.y = -10;
      // } else if (ig.input.state(this.keyMap.DOWN)) {
      //   targetVelocity.y = 10;
      // }

      var dx = targetVelocity.x - currentVelocity.x;
      var dy = targetVelocity.y - currentVelocity.y;

      var mass = this.body.GetMass();
      var impulse = {
        x: mass * dx,
        y: mass * dy
      };
      var vec2 = new Box2D.Common.Math.b2Vec2(impulse.x, impulse.y);
      this.body.ApplyImpulse(vec2, this.body.GetWorldCenter());

      // because of the Math.atan2 call, left could be 0 or 4, so it's in here twice
      var directions = ['walkLeft', 'walkUp', 'walkRight', 'walkDown', 'walkLeft'];
      this.currentAnim = this.anims[(function(vx, vy) {
        if (vx || vy) {
          var directionIndex = Math.floor((Math.atan2(vy, vx) / Math.PI) * 2 + 2);
          return directions[directionIndex];
        }
        return 'idle';
      })(targetVelocity.x, targetVelocity.y)];

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
            target: enemy,
            caster: this,
            velocity: {
              x: this.aim.x * 50,
              y: this.aim.y * 50
            },
          });
        }
      }
      if (ig.input.state(this.keyMap.SHOOT4)) {
        if (enemy) {
          var x = 5;
          for (var i = 0; i < x; i++) {
            ig.game.spawnEntity(EntityLaser, this.pos.x + 6 + (i * 2), this.pos.y + 6, {
              target: enemy,
              caster: this
            });
          }
        }
      }

      // trigger active spell
      if (ig.input.pressed(this.keyMap.USE)) {
        if (this.currentActiveSpell) {
          this.currentActiveSpell = null;
          ig.game.spawnEntity(EntitySpell, this.pos.x + 6, this.pos.y + 6, {
            target: enemy,
            caster: this,
            velocity: {
              x: this.aim.x * 50,
              y: this.aim.y * 50
            },
          });
        }
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
      var self = this;
      // use spell
      spell.combo = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      spell.time = 5;

      spell.combo = spell.combo.map(function (key) {
        return self.keyMap[key];
      });

      // setup combo
      spell.comboHandle = ig.game.comboManager.add(spell.combo, spell.time, function () {
        // set active spell
        self.currentActiveSpell = spell;
      });

      this.knownSpells.push(spell);

    var spellComboImgs = '';
    spell.combo.forEach((button) => {
      spellComboImgs += `<img src="media/buttons/${button[window.controllerType]}"/>`
    });

    $('.player' + this.playerName + ' .spellbook').append(
      '<div class="spell-info item">' +
        '<div class="content">' +
        '<img src="media/icon/' + spell.icon + '" height="16" width="16" />' +
        `<span class="spell-info">${spell.level} - ${spell.name} - ${spell.type}</span>` +
        `<div class="spell-combo">${spellComboImgs}</div>` +
        '</div>' +
      '</div>'
    )
  },

    collision: {group: 'player', name: 'player', collidesWith: ['item', 'spell']},
    onContact: function (initiator) {

    },
    addtoInventory: function (item) {
      this.inventory.push(item);
      console.log('Item Added to Inventory!', this.inventory)
    },
    hasInventoryRoom: function () {
      return this.inventory.length < 4;
    }
  });

  EntityProjectile = ig.Box2DEntity.extend({
    size: {x: 8, y: 4},

    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

    animSheet: new ig.AnimationSheet('media/projectile.png', 8, 4),

    init: function (x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
      this.currentAnim.flip.x = settings.flip;

      var velocity = (settings.flip ? -10 : 10);
      this.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(velocity, 0), this.body.GetPosition());
    }
  });

  EntitySpell = ig.Box2DEntity.extend({
    size: {x: 8, y: 4},

    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

    animSheet: new ig.AnimationSheet('media/crate.png', 8, 4),

    init: function (x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
      this.currentAnim.flip.x = settings.flip;

      var velocity = (settings.flip ? -10 : 10);
      this.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(velocity, 0), this.body.GetPosition());
    }
  });

  EntityPointer = ig.Entity.extend({
    size: {x: 8, y: 4},

    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

    animSheet: new ig.AnimationSheet('media/projectile.png', 8, 4),

    init: function (x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
    }
  });

});
