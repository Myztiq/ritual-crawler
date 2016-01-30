//
// Adapted from one-gamepad support in this thread:
// http://impactjs.com/forums/help/gamepad-events
//
// Put this in a file at lib/plugins/gamepads.js and require plugins.gamepads in your main module.

ig.module(
  'plugins.gamepads'
)
.requires(
  'impact.input',
  'impact.game'
)
.defines(function(){

// Assign some values to the Gamepad buttons. We use an offset of 256
// here so we don't collide with the keyboard buttons when binding.
ig.GAMEPAD_BUTTON_OFFSET = 256;

// Define ig.GAMEPAD1 through ig.GAMEPAD4
for (var i = 1; i <= 4; i++) {
  ig['GAMEPAD' + i] = {
    FACE_1: ig.GAMEPAD_BUTTON_OFFSET * i + 0,
    FACE_2: ig.GAMEPAD_BUTTON_OFFSET * i + 1,
    FACE_3: ig.GAMEPAD_BUTTON_OFFSET * i + 2,
    FACE_4: ig.GAMEPAD_BUTTON_OFFSET * i + 3,
    LEFT_SHOULDER: ig.GAMEPAD_BUTTON_OFFSET * i + 4,
    RIGHT_SHOULDER: ig.GAMEPAD_BUTTON_OFFSET * i + 5,
    LEFT_SHOULDER_BOTTOM: ig.GAMEPAD_BUTTON_OFFSET * i + 6,
    RIGHT_SHOULDER_BOTTOM: ig.GAMEPAD_BUTTON_OFFSET * i + 7,
    SELECT: ig.GAMEPAD_BUTTON_OFFSET * i + 8,
    START: ig.GAMEPAD_BUTTON_OFFSET * i + 9,
    LEFT_ANALOGUE_STICK: ig.GAMEPAD_BUTTON_OFFSET * i + 10,
    RIGHT_ANALOGUE_STICK: ig.GAMEPAD_BUTTON_OFFSET * i + 11,
    PAD_TOP: ig.GAMEPAD_BUTTON_OFFSET * i + 12,
    PAD_BOTTOM: ig.GAMEPAD_BUTTON_OFFSET * i + 13,
    PAD_LEFT: ig.GAMEPAD_BUTTON_OFFSET * i + 14,
    PAD_RIGHT: ig.GAMEPAD_BUTTON_OFFSET * i + 15
  };
}


ig.normalizeVendorAttribute(navigator, 'getGamepads');

if( !navigator.getGamepads ) {
  // No Gamepad support; nothing to do here
  return;
}

ig.Input.inject({
  // gamepad: null,
  currentButtonState: [], // array of vals, one for each gamepad
  lastButtons: [], // array of arrays of vals, one for each gamepad
  hasButtonObject: !!window.GamepadButton,

  getGamepadSnapshot: function(index) {
    var gamepads = navigator.getGamepads();
    if (gamepads && gamepads[index - 1]) {
      return gamepads[index - 1];
    }

    return null;
  },

  pollGamepad: function(index) {
    var gamepad = this.getGamepadSnapshot(index);

    if( !gamepad ) {
      // No gamepad snapshot?
      return;
    }

    this.lastButtons[index] = this.lastButtons[index] || [];

    // Iterate over all buttons, see if they're bound and check
    // for their state
    for( var button = 0; button < gamepad.buttons.length; button++ ) {
      var action = this.bindings[button+ig.GAMEPAD_BUTTON_OFFSET*index];

      // Is the button bound to an action?
      if( action ) {
        // Chrome behavior was changed
        this.currentButtonState[index] = gamepad.buttons[button].pressed;
        // this.currentButtonState[index] = this.hasButtonObject
        //  ? gamepad.buttons[button].pressed // W3C Standard
        //  : gamepad.buttons[button]; // Current Chrome version

        var prevState = this.lastButtons[index][button];

        // Was not pressed, but is now?
        if( !prevState && this.currentButtonState[index] ) {
          this.actions[action] = true;
          this.presses[action] = true;
        }
        // Was pressed, but is no more?
        else if( prevState && !this.currentButtonState[index] ) {
          this.delayedKeyup[action] = true;
        }
      }

      this.lastButtons[index][button] = this.currentButtonState[index];
    }
  }
});

// Always poll gamepad before each frame
ig.Game.inject({
  run: function() {
    for (var i = 1; i <= 4; i++) {
      ig.input.pollGamepad(i);
    }

    this.parent();
  }
})

});