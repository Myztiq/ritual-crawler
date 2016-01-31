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
        this.active = false;
        this.addAnim('idle', 1, [0]);
        this.parent(x, y, settings);

        this.statusHTML = null;
        this.spell = settings.spell;
        this.target = this.spell.target === "self" ? this.caster : settings.target;
        this.isPermanent = this.spell.expiration === -1;

        if (!this.isPermanent) {
          this.timer = new ig.Timer();
          this.timer.set(this.spell.expiration);
          this.setStatusIcon(this.spell.icon);
          this.active = true;
        }


        this.immediateEffect(this.spell.stat, this.spell.powerTotal);

        if (this.target) {
          this.statusBar = '.player'+this.target.playerName+' .status-bar';
        }

        this.kill()
      },

      setStatusIcon (icon) {
        this.statusHTML = $(`<img class="status-effect" id="${Math.random()}" src="media/icon/${icon}"/>`);
        $(this.statusBar).append(this.statusHTML);


      },

      revertEffect() {
        var stat = this.spell.stat;
        var totalPower = this.spell.powerTotal;

        if (this.spell.target === "self") {
          //defensive spell
          this.target['reduce_' + stat](totalPower);
        } else {
          //offensive spell
          this.target['increase_' + stat](totalPower);
        }
      },

      immediateEffect(stat, totalPower) {
        if (this.spell.target === "self") {
          //defensive spell
          this.target['increase_' + stat](totalPower);
        } else {
          //offensive spell
          this.target['reduce_' + stat](totalPower);
        }

      },

      update(){
        if (this.active && this.timer.delta() >= 0) {
          this.active = false;
          this.revertEffect();
          $(this.statusHTML).remove()
        }
      }
    });

  });
