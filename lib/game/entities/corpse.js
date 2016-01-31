ig.module(
  'game.entities.corpse'
)
.requires(
  'plugins.box2d.entity',
  'plugins.comboManager'
)
.defines(function () {

  EntityCorpse = ig.Box2DEntity.extend({
    size: {x: 32, y: 64},
    offset: {x: 0, y: 0},

    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    zIndex: -1,

    init: function (x, y, settings) {
      this.animSheet = new ig.AnimationSheet('media/player-udlr-3f-32x64' + settings.playerName + '.png', 32, 64);
      this.addAnim('idle', 0.5, [12]);
      this.keyMap = {
        LEFT_ACTION: 'left_action_' + this.playerName,
        RIGHT_ACTION: 'right_action_' + this.playerName,
        UP_ACTION: 'up_action_' + this.playerName,
        DOWN_ACTION: 'down_action_' + this.playerName,
      };
      this.spellKeys = [
        this.keyMap.LEFT_ACTION,
        this.keyMap.RIGHT_ACTION,
        this.keyMap.UP_ACTION,
        this.keyMap.DOWN_ACTION
      ];
      this.comboManager = new ComboManager(this.spellKeys);
      this.saved = false;
      this.thingHit = null;
      this.parent(x, y, settings);
    },

    collision: {group: 'corpse', name: 'corpse', collidesWith: ['player']},
    onContact: function (thingHit) {
      // var self = this;
      // if (thingHit && !this.thingHit) {
      //   this.thingHit = thingHit;
      //   $('.respawnPlayer' + thingHit.playerName).append(`<div class="respawn">QUICK! ${respawnComboImgs}</div>`);
      //   self.timer = new ig.Timer();
      //   self.timer.set(1);

      //   var throwHandle = ig.game[key].add(respawnKeys, 1, function () {
      //     $('.respawnPlayer' + self.playerName + ' .respawn').remove();
      //     this.comboManager.remove(throwHandle);
      //     this.saved[thingHit.playerName] = true;
      //   });
      // }
    },
    update: function () {
      this.parent();
      var self = this;

      // if (self.thingHit && self.timer.delta() >= 0) {
      //   self.timer = null;
      //   self.thingHit = null;
      //   $('.respawnPlayer' + self.playerName + ' .respawn').remove();
      //   if (!this.saved) {
      //     this.thingHit.receiveDamage(10, self);
      //   }
      // }
    },
  });

});
