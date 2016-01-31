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
      var self = this;

      this.parent(x, y, settings);

      this.animSheet = new ig.AnimationSheet('media/player-udlr-3f-32x64' + settings.playerName + '.png', 32, 64);
      this.addAnim('idle', 0.5, [12]);

      this.saved = false;
      this.thingHit = null;
      this.comboImg = settings.comboImg;
      this.buttons = settings.buttons;

      var force = new Box2D.Common.Math.b2Vec2(7,3);
      var offset = this.body.GetPosition();
      offset.y = offset.y + this.size.y;
      this.body.ApplyImpulse(force , this.body.GetPosition());
    },

    collision: {group: 'corpse', name: 'corpse', collidesWith: ['player']},
    onContact: function (thingHit) {
      var self = this;
      if (thingHit && !self.thingHit) {
        self.comboManager = new ComboManager(thingHit.spellKeys);
        self.thingHit = thingHit;

        var savingThrowCombo = [self.buttons.random()];
        var savingThrowKeys = savingThrowCombo.map(function (key) {
          return thingHit.keyMap[key.direction];
        });

        var savingThrowComboImgs = '';
        savingThrowCombo.forEach((button) => {
          savingThrowComboImgs += `<img src="media/buttons/${button[thingHit.gamepadType]}" height="32" width="32"/>`
        });

        $('.respawnPlayer' + thingHit.playerName).append(`<div class="respawn">QUICK! ${savingThrowComboImgs}</div>`);
        self.timer = new ig.Timer();
        self.timer.set(1);

        var throwHandle = self.comboManager.add(savingThrowKeys, 5, function () {
          $('.respawnPlayer' + thingHit.playerName + ' .respawn').remove();
          self.comboManager.remove(throwHandle);
          self.saved = true;
        });
      }
    },

    update: function () {
      this.parent();
      if (this.comboManager) this.comboManager.update();

      if (this.timer && this.timer.delta() >= 0) {
        if (this.thingHit) $('.respawnPlayer' + this.thingHit.playerName + ' .respawn').remove();
        if (!this.saved && this.thingHit) this.thingHit.receiveDamage(10, this);
        this.comboManager = null;
        this.timer = null;
        this.thingHit = null;
        this.saved = false;
      }
    },
  });

});
