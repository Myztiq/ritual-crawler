ig.module(
  'game.entities.item'
  )
  .requires(
    'plugins.box2d.entity'
  )
  .defines(function () {

    EntityItem = ig.Box2DEntity.extend({

      size: {x: 32, y: 32},

      killme: false,

      type: ig.Entity.TYPE.B,
      checkAgainst: ig.Entity.TYPE.A,
      collides: ig.Entity.COLLIDES.PASSIVE,

      animSheet: new ig.AnimationSheet('media/basic_leggings.png', 32, 32),

      init: function (x, y, settings) {
        this.icon = 'default.png';
        this.addAnim('idle', 1, [0]);
        this.parent(x, y, settings);
      },

      collision: {group: 'item', name: 'item', collidesWith: ['player']},
      onContact: function (initiator) {
        if (initiator.hasInventoryRoom()) {
          this.kill();
          initiator.addToInventory({
            icon: this.icon,
            type: this.type,
            sprite: this.currentAnim
          });
        }
      }
    });

  });
