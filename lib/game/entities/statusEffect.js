ig.module(
  'game.entities.statusEffect'
  )
  .requires(
    'plugins.box2d.entity'
  )
  .defines(function () {

    EntityStatusEffect = ig.Box2DEntity.extend({
      size: {x: 8, y: 8},

      type: ig.Entity.TYPE.B,

      checkAgainst: ig.Entity.TYPE.NONE,
      collides: ig.Entity.COLLIDES.NEVER,

      animSheet: new ig.AnimationSheet('media/crate.png', 0, 0),

      init(x, y, settings) {
        this.addAnim('idle', 1, [0]);
        this.parent(x, y, settings);

        this.spell = settings.spell;

        this.statusHTML = null;
        this.statusBar = '.player'+this.target.playerName+' .status-bar';

        this.timer = new ig.Timer();
        this.timer.set(this.spell.expiration);

        this.target = settings.target;

        if (!this.active ) {
          this.setStatusIcon(this.spell.icon);
          this.active = true;
          this.kill()
        }

      },

      setStatusIcon (icon) {
        console.log( 'Set Status Effect' );
        this.statusHTML = $(`<img class="status-effect" id="${Math.random()}" src="media/icon/${icon}"/>`);
        $(this.statusBar).append(this.statusHTML);

        if (this.spell.powerTotal) {
          this.immediateEffect(this.spell.stat, this.spell.powerTotal);
        }
      },

      immediateEffect(stat, totalPower) {
        console.log( 'Immediate Effect' );
        this.target[stat] += totalPower;
      },

      update(){

        if (this.active && this.timer.delta() >= 0) {
          this.active = false;
          $(this.statusHTML).remove()
        }
      }
    });

  });
