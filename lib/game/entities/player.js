ig.module(
  'game.entities.player'
)
.requires(
  'impact.entity',
  'game.entities.fireball',
  'game.entities.laser',
  'game.entities.homing',
  'game.entities.corpse',
  'plugins.box2d.entity',
  'plugins.comboManager'
)
.defines(function () {
  EntityPlayer = ig.Box2DEntity.extend({
    size: {x: 32, y: 64},
    offset: {x: 0, y: 0},

    health: 100,
    maxHealth: 100,
    armor: 10,
    maxArmor: 50,

    maxVelocity: 40,
    aim: {x: 0, y: 0},
    reticle: null,
    gamepadType: 'ps',

    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

    // animSheet: new ig.AnimationSheet('media/player-udlr-3f-32x64.png', 32, 64),
    castSpell: [
      new ig.Sound( 'media/sounds/chanting+magic.ogg' ),
      new ig.Sound( 'media/sounds/chanting+magic02.ogg' ),
      new ig.Sound( 'media/sounds/chanting+magic03.ogg' ),
      new ig.Sound( 'media/sounds/chanting+magic04.ogg' )
    ],

    flip: false,

    inventory: {
      left: null,
      up: null,
      right: null,
      down: null
    },
    knownSpells: [],
    steps: [
      new ig.Sound( 'media/sounds/Step02.ogg' ),
      new ig.Sound( 'media/sounds/Step03.ogg' ),
      new ig.Sound( 'media/sounds/Step04.ogg' )
    ],

    init: function (x, y, settings) {
      var self = this;
      this.soundTimer = new ig.Timer();
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
      this.animSheet = new ig.AnimationSheet('media/player-udlr-3f-32x64' + this.playerName + '.png', 32, 64);
      this.addAnim('walkDownRight', 0.2, [0,1,2]);
      this.addAnim('walkDownLeft', 0.2, [3,4,5]);
      this.addAnim('walkUp', 0.2, [6,7]);
      this.addAnim('idle', 0.5, [9,10]);
      this.addAnim('dead', 1, [12]);

      if (!ig.global.wm) {
        this.body.SetFixedRotation(true);
      }
      window.player = this;

      this.spellKeys = [
        this.keyMap.LEFT_ACTION,
        this.keyMap.RIGHT_ACTION,
        this.keyMap.UP_ACTION,
        this.keyMap.DOWN_ACTION
      ];


      this.comboManager = new ComboManager(this.spellKeys);
      // add back old spells
      if (settings.knownSpells) {
        this.knownSpells = settings.knownSpells;
        this.knownSpells.forEach((spell) => {
          spell.comboHandle = this.comboManager.add(spell.comboButtons, spell.time, function () {
            // set active spell
            $('.player' + this.playerName + ' .spell-text').removeClass('active-spell');

            self.currentActiveSpell = spell;
          });
        });
      }

      if (settings.inventory) {
        this.inventory = settings.inventory;
      }
    },

    increase_health(qty){
      this.health += qty;
      this.maxHealth += qty;
    },

    reduce_health(qty){
      if (this.health <= 0) {return;}
      if (this.health <= qty) {
        this.health = 1;
      } else {
        this.health -= qty;
      }

      this.maxHealth -= qty;
    },

    increase_armor(qty){
      this.armor += qty;
      this.maxArmor += qty;
    },

    reduce_armor(qty){
      if (this.armor <= qty) {
        this.armor = 0;
      } else {

        this.armor -= qty;
      }
      this.maxArmor -= qty;
    },

    increase_speed(qty) {
      this.maxVelocity += qty
    },

    reduce_speed(qty) {
      this.maxVelocity -= qty
    },

    receiveDamage(damage, cause) {
      this.tookDamage = cause;
      var remainingDamage = damage - this.armor;
      if (remainingDamage <= 0 ) {
        remainingDamage = 0;
        this.armor -= damage
      } else {
        this.armor = 0;
        this.parent(remainingDamage, cause)
      }
    },

    kill: function () {
      if (this.pointer) this.pointer.kill();
      if (this.eyes) this.eyes.kill();
      if (this.reticle) this.reticle.kill();

      var self = this;
      if (self.killme) {

        if (this.spawnedStuff) {
          return
        }
        this.spawnedStuff = true;
        // deselect all spells
        $('.player' + this.playerName + ' .spell-text').css('text-decoration', 'none');

        ig.game.spawnEntity(EntityHead, self.pos.x, self.pos.y);

        var buttons = [
          {direction: 'LEFT_ACTION',   ps: 'sony/square-icon.png',    xbox: 'xbox/x-icon.png'},
          {direction: 'UP_ACTION',     ps: 'sony/triangle-icon.png',  xbox: 'xbox/y-icon.png'},
          {direction: 'RIGHT_ACTION',  ps: 'sony/circle-icon.png',    xbox: 'xbox/b-icon.png'},
          {direction: 'DOWN_ACTION',   ps: 'sony/cross-icon.png',     xbox: 'xbox/a-icon.png'}
        ];

        var respawnCombo = [];

        for (var i =0; i < 5; i++) {
          respawnCombo.push(buttons.random());
        }

        var respawnComboImgs = '';

        var respawnKeys = respawnCombo.map(function (key) {
          return self.keyMap[key.direction];
        });

        respawnCombo.forEach((button) => {
          respawnComboImgs += `<img src="media/buttons/${button[this.gamepadType]}" height="32" width="32"/>`
        });

        $('.respawnPlayer' + this.playerName).append(`<div class="respawn">respawn!<br>${respawnComboImgs}</div>`);

        var key = 'playerDeathCombo' + this.playerName;
        ig.game[key] = new ComboManager(this.spellKeys);

        ig.game.spawnEntity(EntityCorpse, self.pos.x, self.pos.y, {
          playerName: self.playerName,
          buttons: buttons
        });

        // setup combo
        var respawnHandle = ig.game[key].add(respawnKeys, 999999, function () {
          $('.respawnPlayer' + self.playerName + ' .respawn').remove();

          ig.game[key].remove(respawnHandle);

          // come back alive
          var player = ig.game.spawnEntity(EntityPlayer, self.pos.x, self.pos.y, {
            playerName: self.playerName,
            comboManager: self.comboManager,
            knownSpells: self.knownSpells,
            inventory: self.inventory
          });
        });
      }
      this.parent();
    },

    draw: function () {
      // border/background
      ig.system.context.fillStyle = "rgb(0,0,0)";
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
      ig.system.context.fillStyle = "rgb(255,0,0)";
      ig.system.context.beginPath();
      ig.system.context.rect(
        (this.pos.x - (this.size.x / 2) - ig.game.screen.x + 1) * ig.system.scale,
        (this.pos.y - ig.game.screen.y - 7) * ig.system.scale,
        ((this.size.x - 2) * (this.health / (this.maxHealth + 4))) * ig.system.scale * 3,
        2 * ig.system.scale
      );
      ig.system.context.closePath();
      ig.system.context.fill();

      ig.system.context.fillStyle = "rgb(0,0,0)";
      ig.system.context.beginPath();
      ig.system.context.rect(
        (this.pos.x - (this.size.x / 2) - ig.game.screen.x) * ig.system.scale,
        (-5 + this.pos.y - ig.game.screen.y - 8) * ig.system.scale,
        this.size.x * ig.system.scale * 3 - 8,
        4 * ig.system.scale
      );
      ig.system.context.closePath();
      ig.system.context.fill();

      // armor bar
      ig.system.context.fillStyle = "rgb(0,0,255)";
      ig.system.context.beginPath();
      ig.system.context.rect(
        (this.pos.x - (this.size.x / 2) - ig.game.screen.x + 1) * ig.system.scale,
        (-5+  this.pos.y - ig.game.screen.y - 7) * ig.system.scale,
        ((this.size.x - 2) * (this.armor / (this.maxArmor + 4))) * ig.system.scale * 3,
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

      if (this.health === this.maxHealth && this.armor < this.maxArmor) {
        this.armor += 0.001;
      }

      this.comboManager.update();

      var enemy = ig.game.getEntitiesByType('EntityPlayer').find(function (entity) {
        return entity.playerName !== self.playerName;
      });

      // used to test attack
      // if (ig.input.pressed('M'+ this.playerName)) {
      //   var aimAngle = Math.atan2(this.aim.y, this.aim.x);
      //   var aimX = Math.cos(aimAngle) * 50;
      //   var aimY = Math.sin(aimAngle) * 50;

      //   ig.game.spawnEntity(EntityAttackHoming, this.pos.x + 6, this.pos.y + 6, {
      //     spell: {
      //      "name": "Bees!?",
      //      "icon": "spells/terror-1.png",
      //      "damageBase": 100,
      //      "rangeBase": 1,
      //      "duration": 0,
      //      "expiration": 0,
      //      "entity": EntityAttackHoming,
      //      "level": 1
      //     },
      //     target: enemy,
      //     caster: this,
      //     velocity: {
      //       x: aimX,
      //       y: aimY
      //     },
      //   });
      // }

      // CONTROLLER TYPE
      if (ig.input.state(this.keyMap.TYPE)) {
        this.gamepadType = ig.input.state(this.keyMap.TYPE);
        // console.log('type', ig.input.state(this.keyMap.TYPE), this.gamepadType);
      }

      // SCREEN POSITION
      this.screenPosition();

      // PLAYER POSITION
      this.playerPosition();

      // RETICLE POSITION
      this.reticlePosition();

      // EYES POSITON
      this.eyesPosition();

      // SPELL CASTING
      this.spellCasting(enemy);

      // USE ITEMS
      this.useItems();

      // ENEMY POINTER
      if (enemy) this.pointerPosition(enemy);

      this.parent();
    },

    useItems: function () {
      var self = this;
      function spawnEntity (oldItem) {
        if (oldItem.type === 'skull') {
          ig.game.spawnEntity(EntityHead, self.pos.x, self.pos.y + 75);
        } else {
          ig.game.spawnEntity(EntityItem, self.pos.x, self.pos.y + 75);
        }
      };

      if (ig.input.pressed(this.keyMap.LEFT_ITEM)) {
        this.removeItemFromInventory('left', (oldItem) => {
          spawnEntity(oldItem);
        });
      }

      if (ig.input.pressed(this.keyMap.RIGHT_ITEM)) {
        this.removeItemFromInventory('right', (oldItem) => {
          spawnEntity(oldItem);
        });
      }

      if (ig.input.pressed(this.keyMap.UP_ITEM)) {
        this.removeItemFromInventory('up', (oldItem) =>{
          spawnEntity(oldItem);
        });
      }

      if (ig.input.pressed(this.keyMap.DOWN_ITEM)) {
        this.removeItemFromInventory('down', (oldItem) =>{
          spawnEntity(oldItem);
        });
      }
    },

    pointerPosition: function (enemy) {
      var angleToEnemy = this.angleTo(enemy);
      var distanceToEnemy = this.distanceTo(enemy);

      if (!this.pointer) {
        this.pointer = ig.game.spawnEntity(EntityPointer, this.pos.x, this.pos.y);
      }

      var distancePercentage = distanceToEnemy / 400;
      if (distancePercentage > .1) {
        var actualDistance = 48;

        var xMovement = Math.cos(angleToEnemy) * actualDistance;
        var yMovement = Math.sin(angleToEnemy) * actualDistance;

        this.pointer.pos.x = this.pos.x + (this.size.x / 2) + xMovement - (this.pointer.size.x / 2);
        this.pointer.pos.y = this.pos.y + (this.size.y / 2) + yMovement - (this.pointer.size.y / 2);
        this.pointer.currentAnim.angle = angleToEnemy;
        this.pointer.currentAnim.alpha = distancePercentage - .1;
      } else {
        this.pointer.currentAnim.alpha = 0;
      }
    },

    eyesPosition: function () {
      if (!this.eyes) {
        this.eyes = ig.game.spawnEntity(EntityEyes, this.pos.x, this.pos.y);
        console.log(this)
      }
      this.eyes.currentAnim.alpha = 0;

      if (this.currentAnim === this.anims['idle']) {
        this.eyes.pos.x = this.pos.x + 12;
        this.eyes.pos.y = this.pos.y + 1;
        this.eyes.currentAnim.alpha = 1;
      }
    },

    reticlePosition: function () {
      if (ig.input.state(this.keyMap.AIM_X) || ig.input.state(this.keyMap.AIM_Y)) {
        // console.log('aim x', ig.input.state(this.keyMap.AIM_X));
        // console.log('aim y', ig.input.state(this.keyMap.AIM_Y));
        this.aim.x = ig.input.state(this.keyMap.AIM_X);
        this.aim.y = ig.input.state(this.keyMap.AIM_Y);
      }

      if (this.knownSpells.length) {
        if (!this.reticle) {
          this.reticle = ig.game.spawnEntity(EntityReticle, this.pos.x, this.pos.y);
        }

        var angleToReticle = Math.atan2(this.aim.y, this.aim.x);
        var reticleX = Math.cos(angleToReticle) * 54;
        var reticleY = Math.sin(angleToReticle) * 54;

        this.reticle.pos.x = this.pos.x + (this.size.x / 2) + reticleX - (this.reticle.size.x / 2);
        this.reticle.pos.y = this.pos.y + (this.size.y / 2) + reticleY - (this.reticle.size.y / 2);
        this.reticle.currentAnim.angle = this.angleTo(this.reticle);
      }
    },

    playerPosition: function () {
      var self = this;
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

      // because of the Math.atan2 call, left could be 0 or 4, so it's in here twice
      var directions = ['walkDownLeft', 'walkUp', 'walkDownRight', 'walkDownLeft'];
      this.currentAnim = this.anims[(function(vx, vy) {
        if (vx || vy) {
          var directionIndex = Math.floor(((Math.atan2(vy, vx) + ((Math.PI * 3) / 2)) / (Math.PI * 2)) * 3);

          if (self.soundTimer.delta() > 0) {
            self.soundTimer.set(0.25);
            var step = self.steps.random();
            step.volume = 0.25;
            step.play();
          }

          return directions[directionIndex];
        }
        return 'idle';
      })(targetVelocity.x, targetVelocity.y)];
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

      if (this.tookDamage) {
        console.log(this.tookDamage)
        var angle = this.angleTo(this.tookDamage) + Math.PI;
        screen.camera.x += Math.cos(angle) * 20;
        screen.camera.y += Math.sin(angle) * 20;
        this.tookDamage = false;
      }
    },

    spellCasting: function (enemy) {
      // init spell casting
      if (ig.input.pressed(this.keyMap.USE)) {
        if (this.currentActiveSpell) {
          $('.player' + this.playerName + ' .active-spell').removeClass('active-spell');

          this.currentActiveSpell.timer = new ig.Timer();
          this.castSpell.random().play();
        }
      }

      // during spell holding
      if (ig.input.state(this.keyMap.USE)) {
        if (this.currentActiveSpell && this.currentActiveSpell.timer &&
           (this.currentActiveSpell.timer.delta() <= this.currentActiveSpell.duration)) {

          var aimAngle = Math.atan2(this.aim.y, this.aim.x);
          var aimX = Math.cos(aimAngle) * 50;
          var aimY = Math.sin(aimAngle) * 50;

          ig.game.spawnEntity(this.currentActiveSpell.entity, this.pos.x + 6, this.pos.y + 6, {
            spell: this.currentActiveSpell,
            target: enemy,
            caster: this,
            velocity: {
              x: aimX,
              y: aimY
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
      var oldItem = this.inventory[slotName];
      $('.player' + this.playerName + ' .inventory .' + slotName).remove();
      this.inventory[slotName] = null;
      if (wasItem) {
        spawnItem(oldItem);
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
      spell.comboHandle = this.comboManager.add(spell.comboButtons, spell.time, function () {
        // set active spell

        $('.player' + this.playerName + ' .active-spell').removeClass('active-spell');
        $('.' + spell.id).parent().parent().addClass('active-spell');

        self.currentActiveSpell = spell;
      });

      this.knownSpells.push(spell);
      var spellComboImgs = '';

      spell.combo.forEach((button) => {
        spellComboImgs += `<img src="media/buttons/${button[this.gamepadType]}" height="32" width="32"/>`
      });

      $('.player' + this.playerName + ' .spellbook').append(
        '<div class="spell-text item">' +
        '<div class="content">' +
        '<img src="media/icon/' + spell.icon + '" class="spell-icon" />' +
        '</span>' +
        `<span class="spell-text ${spell.id}">${spell.name}</span>` +
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
    size: {x: 32, y: 32},

    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

    animSheet: new ig.AnimationSheet('media/head.png', 32, 64),

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

  EntityPointer = ig.Entity.extend({
    size: {x: 24, y: 24},

    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

    animSheet: new ig.AnimationSheet('media/pointer.png', 24, 24),

    init: function (x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
    }
  });

  EntityEyes = ig.Entity.extend({
    size: {x: 12, y: 15},

    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

    animSheet: new ig.AnimationSheet('media/eyes.png', 12, 15),

    init: function (x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', .1, [0,1,2,3,5,6,7,8]);
    }
  });

  EntityReticle = ig.Entity.extend({
    size: {x: 24, y: 24},

    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!

    animSheet: new ig.AnimationSheet('media/reticle.png', 24, 24),

    init: function (x, y, settings) {
      this.parent(x, y, settings);
      this.addAnim('idle', 1, [0]);
    }
  });

});
