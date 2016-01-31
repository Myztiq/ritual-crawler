ig.module(
  'game.entities.player'
)
.requires(
  'impact.entity',
  'game.entities.fireball',
  'game.entities.laser',
  'game.entities.homing',
  'plugins.box2d.entity'
)
.defines(function () {
  EntityPlayer = ig.Box2DEntity.extend({
    size: {x: 32, y: 64},
    offset: {x: 0, y: 0},

    health: 100,
    maxHealth: 100,

    maxVelocity: 40,
    aim: {x: 0, y: 0},
    reticle: null,
    gamepadType: 'ps',

    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

    animSheet: new ig.AnimationSheet('media/player-udlr-3f-32x64.png', 32, 64),
    castSpell: new ig.Sound( 'media/sounds/chanting+magic.ogg' ),

    flip: false,

    inventory: {
      left: null,
      up: null,
      right: null,
      down: null
    },
    knownSpells: [],

    init: function (x, y, settings) {
      var self = this;
      this.parent(x, y, settings);
      this.keyMap = {
        MOVE_X: 'moveX_' + this.playerName,
        MOVE_Y: 'moveY_' + this.playerName,

        AIM_X: 'aimX_' + this.playerName,
        AIM_Y: 'aimY_' + this.playerName,
        TYPE: 'type_' + this.playerName,

        LEFT_ACTION: 'left_action_' + this.playerName,
        RIGHT_ACTION: 'right_action_' + this.playerName,
        UP_ACTION: 'up_action_' + this.playerName,
        DOWN_ACTION: 'down_action_' + this.playerName,

        LEFT_ITEM: 'dpad_' + this.playerName + '_left',
        RIGHT_ITEM: 'dpad_' + this.playerName + '_right',
        UP_ITEM: 'dpad_' + this.playerName + '_up',
        DOWN_ITEM: 'dpad_' + this.playerName + '_down',

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
      window.player = this;
    },

    kill: function () {
      this.pointer.kill();
      var self = this;
      if (self.killme) {
        ig.game.spawnEntity(EntityHead, self.pos.x, self.pos.y);
        this.parent();
        return
      }
      setTimeout(function () {
        var player = ig.game.spawnEntity(EntityPlayer, self.pos.x, self.pos.y, {
          playerName: self.playerName
        });
        player.knownSpells = self.knownSpells;
        player.inventory = self.inventory;
      }, 2000);
      this.parent();
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

      if( this.health <= 0 ) {
        this.kill();
      }

      var enemy = ig.game.getEntitiesByType('EntityPlayer').find(function (entity) {
        return entity.playerName !== self.playerName;
      });




      // SCREEN POSITION
      this.screenPosition()



      // PLAYER POSITION
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

      var dx = targetVelocity.x - currentVelocity.x;
      var dy = targetVelocity.y - currentVelocity.y;

      var mass = this.body.GetMass();
      var impulse = {
        x: mass * dx,
        y: mass * dy
      };
      var vec2 = new Box2D.Common.Math.b2Vec2(impulse.x, impulse.y);
      this.body.ApplyImpulse(vec2, this.body.GetWorldCenter());




      // RETICLE POSITION
      if (ig.input.state(this.keyMap.AIM_X) || ig.input.state(this.keyMap.AIM_Y)) {
        // console.log('aim x', ig.input.state(this.keyMap.AIM_X));
        // console.log('aim y', ig.input.state(this.keyMap.AIM_Y));
        this.aim.x = ig.input.state(this.keyMap.AIM_X);
        this.aim.y = ig.input.state(this.keyMap.AIM_Y);
      }

      if (!this.reticle) {
        this.reticle = ig.game.spawnEntity(EntityPointer, this.pos.x + this.aim.x * 50, this.pos.y + this.aim.y * 50);
      }

      var angleToReticle = Math.atan2(this.aim.y, this.aim.x);
      var reticleX = Math.cos(angleToReticle) * 50;
      var reticleY = Math.sin(angleToReticle) * 50;

      this.reticle.pos.x = this.pos.x + (this.size.x / 2) + reticleX - (this.reticle.size.x / 2);
      this.reticle.pos.y = this.pos.y + (this.size.y / 2) + reticleY - (this.reticle.size.y / 2);
      this.reticle.currentAnim.angle = this.angleTo(this.reticle);





      // CONTROLLER TYPE
      if (ig.input.state(this.keyMap.TYPE)) {
        this.gamepadType = ig.input.state(this.keyMap.TYPE);
        // console.log('type', ig.input.state(this.keyMap.TYPE), this.gamepadType);
      }




      // because of the Math.atan2 call, left could be 0 or 4, so it's in here twice
      var directions = ['walkLeft', 'walkUp', 'walkRight', 'walkDown', 'walkLeft'];
      this.currentAnim = this.anims[(function(vx, vy) {
        if (vx || vy) {
          var directionIndex = Math.floor((Math.atan2(vy, vx) / Math.PI) * 2 + 2);
          return directions[directionIndex];
        }
        return 'idle';
      })(targetVelocity.x, targetVelocity.y)];

      // use items
      if (ig.input.pressed(this.keyMap.LEFT_ITEM)) {
        this.removeItemFromInventory('left', () =>
          ig.game.spawnEntity(EntityItem, this.pos.x, this.pos.y + 75)
        );
      }

      if (ig.input.pressed(this.keyMap.RIGHT_ITEM)) {
        this.removeItemFromInventory('right', () =>
          ig.game.spawnEntity(EntityItem, this.pos.x, this.pos.y + 75)
        );
      }

      if (ig.input.pressed(this.keyMap.UP_ITEM)) {
        this.removeItemFromInventory('up', () =>
          ig.game.spawnEntity(EntityItem, this.pos.x, this.pos.y + 75)
        );
      }

      if (ig.input.pressed(this.keyMap.DOWN_ITEM)) {
        this.removeItemFromInventory('down', () =>
          ig.game.spawnEntity(EntityItem, this.pos.x, this.pos.y + 75)
        );
      }

      this.spellCasting(enemy);


      // move!
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

          this.pointer.pos.x = this.pos.x + (this.size.x / 2) + xMovement;
          this.pointer.pos.y = this.pos.y + (this.size.y / 2) + yMovement;
          this.pointer.currentAnim.angle = angleToEnemy;
          this.pointer.currentAnim.alpha = distancePercentage - .1;
        } else {
          this.pointer.currentAnim.alpha = 0;
        }
      }

      this.parent();
    },

    screenPosition: function () {
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
    },

    spellCasting: function (enemy) {
      // init spell casting
      if (ig.input.pressed(this.keyMap.USE)) {
        if (this.currentActiveSpell) {
          $('.spell-info').css('text-decoration', 'none');
          this.currentActiveSpell.timer = new ig.Timer();
          this.castSpell.play();
        }
      }

      // during spell holding
      if (ig.input.state(this.keyMap.USE)) {
        if (this.currentActiveSpell && this.currentActiveSpell.timer &&
           (this.currentActiveSpell.timer.delta() <= this.currentActiveSpell.duration)) {
          ig.game.spawnEntity(this.currentActiveSpell.entity, this.pos.x + 6, this.pos.y + 6, {
            spell: this.currentActiveSpell,
            target: enemy,
            caster: this,
            velocity: {
              x: this.aim.x * 50,
              y: this.aim.y * 50
            },
          });
        }
      }

      // spell end
      if (ig.input.released(this.keyMap.USE)) {
        this.currentActiveSpell = null;
      }
    },

    removeItemFromInventory: function (slotName, spawnItem) {
      var wasItem = !! this.inventory[slotName];
      $('.player' + this.playerName + ' .inventory .' + slotName).remove();
      this.inventory[slotName] = null;
      if (wasItem) {
        spawnItem();
      }
    },

    addToInventory: function (item) {
      var order = ['left', 'up', 'right', 'down'];

      var emptySlot = order.find((slot) => {
        return this.inventory[slot] === null;
      });

      this.inventory[emptySlot] = item;
      $('.player' + this.playerName + ' .inventory').append(
        `<img class="${emptySlot}" src="media/icon/items/${item.icon}"/>`
      );

    },


    hasInventoryRoom: function () {
      return (
        this.inventory.up     === null  ||
        this.inventory.down   === null  ||
        this.inventory.left   === null  ||
        this.inventory.right  === null
      );
    },

    getFixture: function () {
      var fixture = this.parent();
      if (this.playerName === 'A') {
        fixture.filter.categoryBits = 0x0010;
      } else {
        fixture.filter.categoryBits = 0x0100;
      }
      return fixture;
    },

    addToSpellBook: function (spell) {
      var self = this;
      if (spell === undefined) { return; }
      spell.time = 5;
      spell.id = _.uniqueId('spellId-');

      spell.comboButtons = spell.combo.map(function (key) {
        return self.keyMap[key.direction];
      });

      // setup combo
      spell.comboHandle = ig.game.comboManager.add(spell.comboButtons, spell.time, function () {
        // set active spell
        $('.spell-info').css('text-decoration', 'none');
        $('.' + spell.id).css('text-decoration', 'underline');
        self.currentActiveSpell = spell;
      });

      this.knownSpells.push(spell);
      var spellComboImgs = '';
      console.log(spell.combo);
      spell.combo.forEach((button) => {
        spellComboImgs += `<img src="media/buttons/${button[this.gamepadType]}" height="32" width="32"/>`
      });


      $('.player' + this.playerName + ' .spellbook').append(
        '<div class="spell-info item">' +
        '<div class="content">' +
        '<img src="media/icon/' + spell.icon + '" height="16" width="16" />' +
        `<span class="spell-info ${spell.id}">${spell.level} - ${spell.name} - ${spell.type}</span>` +
        `<div class="spell-combo">${spellComboImgs}</div>` +
        '</div>' +
      '</div>'
    )
  },

    collision: {group: 'player', name: 'player', collidesWith: ['item', 'spell']},
    onContact: function (initiator) {

    }
  });

  EntityHead = ig.Box2DEntity.extend({
    size: {x: 16, y: 16},

    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

    animSheet: new ig.AnimationSheet('media/icon/items/skull.png', 16, 16),

    init: function (x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);

      var velocity = (Math.random() >.5 ? -50 : 50);
      var position = this.body.GetPosition();
      position.x += (Math.random() - .5);
      position.y += (Math.random() - .5);
      this.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(velocity, 0), position);
    },
    getBody: function () {
      var body = this.parent();
      body.linearDamping = 3;
      body.angularDamping = 3;
      return body;
    },
    collision: {group: 'skull', name: 'skull', collidesWith: ['player']},
    onContact: function (initiator) {
      if (initiator.killme) {
        return;
      }
      if (initiator.hasInventoryRoom() && !this.killme) {
        this.kill();
        initiator.addToInventory({
          icon: 'skull.png',
          type: 'skull'
        })
      }
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

      this.caster = settings.caster;
      this.addAnim('idle', 1, [0]);

      this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2(settings.velocity.x, settings.velocity.y), this.body.GetPosition() );

      this.timer = new ig.Timer();
      this.timer.set( 5 );
    },

    update: function () {
      var angularVel = this.body.GetLinearVelocity()
      this.body.SetAngle(Math.atan2(angularVel.y, angularVel.x))
      this.parent();
      if (this.timer.delta() > 0) {
        this.kill();
      }
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
