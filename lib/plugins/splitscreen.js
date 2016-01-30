// https://github.com/Joncom/impact-splitscreen/blob/master/lib/plugins/splitscreen.js

ig.module('plugins.splitscreen')
  .requires('impact.system', 'impact.game')
  .defines(function(){
    ig.Game.inject({

      _screenTemplate: {
        camera: { x: 0, y: 0 },
        size: { x: 0, y: 0 },
        pos: { x: 0, y: 0 }
      },

      screens: [],

      init: function() {
        this.screens = this.getTwoScreens();
        this.initScreens(this.screens);
      },

      draw: function(){

        if( this.clearColor ) {
          ig.system.clear( this.clearColor );
        }

        var origSystemWidth = ig.system.width;
        var origSystemHeight = ig.system.height;
        var origCanvas = ig.system.canvas;
        var origContext = ig.system.context;

        for(var i=0; i<this.screens.length; i++) {
          var screen = this.screens[i];
          this.screen.x = screen.camera.x;
          this.screen.y = screen.camera.y;
          ig.system.width = screen.size.x;
          ig.system.height = screen.size.y;
          ig.system.canvas = ig.system.canvases[i];
          ig.system.context = ig.system.contexts[i];
          this.parent();
        }

        // Restore original settings.
        ig.system.width      = origSystemWidth;
        ig.system.height     = origSystemHeight;
        ig.system.canvas     = origCanvas;
        ig.system.context    = origContext;

        // Draw individual canvases on main canvas.
        for(var i=0; i<this.screens.length; i++) {
          var canvas = ig.system.canvases[i];
          var x = this.screens[i].pos.x * ig.system.scale;
          var y = this.screens[i].pos.y * ig.system.scale;
          ig.system.context.drawImage(canvas, x, y);
        }
      },

      getTwoScreens: function() {

        var screen1 = ig.copy(this._screenTemplate);
        screen1.size.x = ig.system.width / 2;
        screen1.size.y = ig.system.height;

        var screen2 = ig.copy(this._screenTemplate);
        screen2.size.x = ig.system.width / 2;
        screen2.size.y = ig.system.height;
        screen2.pos.x = ig.system.width / 2;

        return [screen1, screen2];
      },

      getFourScreens: function() {

        var template = ig.copy(this._screenTemplate);
        template.size.x = ig.system.width / 2;
        template.size.y = ig.system.height / 2;

        var screen1 = ig.copy(template);

        var screen2 = ig.copy(template);
        screen2.pos.x = ig.system.width / 2;

        var screen3 = ig.copy(template);
        screen3.pos.y = ig.system.height / 2;

        var screen4 = ig.copy(template);
        screen4.pos.x = ig.system.width / 2;
        screen4.pos.y = ig.system.height / 2;

        return [screen1, screen2, screen3, screen4];
      },

      initScreens: function(screens) {

        ig.system.canvases = [];
        ig.system.contexts = [];

        for(var i=0; i<screens.length; i++) {

          var screen = this.screens[i];

          // Create canvas.
          var realWidth = screen.size.x * ig.system.scale;
          var realHeight = screen.size.y * ig.system.scale;
          var canvas = ig.$new('canvas');
          canvas.width = realWidth;
          canvas.height = realHeight;

          var context = canvas.getContext('2d');

          ig.system.canvases.push(canvas);
          ig.system.contexts.push(context);
        }
      }

    });


    ig.System.inject({
      canvases: [],
      contexts: []
    });

  });