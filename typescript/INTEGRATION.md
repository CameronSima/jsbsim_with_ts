# JSBSim Browser Game Integration Guide

## Required Files

Copy these files from the `dist` folder to your game:

```
your-game/
└── libs/jsbsim/
    ├── jsbsim.js         # WebAssembly loader
    ├── jsbsim.wasm       # WebAssembly binary
    ├── jsbsim.data       # Aircraft data
    └── jsbsim.bundle.js  # TypeScript wrapper
```

## Integration Methods

### Method 1: Script Tags (Simplest)

```html
<!-- In your game's HTML -->
<script type="module">
  // Load WebAssembly module
  import JSBSimModule from "./libs/jsbsim/jsbsim.js";

  // Make it globally available
  window.JSBSimModule = JSBSimModule;
</script>

<!-- Load the wrapper -->
<script src="./libs/jsbsim/jsbsim.bundle.js"></script>

<script>
  // Your game code
  async function initGame() {
    const jsbsim = await JSBSim.create();
    await jsbsim.initialize();

    // Load aircraft
    const loaded = jsbsim.loadAircraft("c172p");
    if (loaded) {
      // Start your game
      gameLoop(jsbsim);
    }
  }
</script>
```

### Method 2: ES6 Modules (Modern)

```javascript
// game.js
import JSBSimModule from "./libs/jsbsim/jsbsim.js";
import "./libs/jsbsim/jsbsim.bundle.js";

class Game {
  async init() {
    // Ensure module is available
    window.JSBSimModule = JSBSimModule;

    // Create JSBSim instance
    this.jsbsim = await JSBSim.create();
    await this.jsbsim.initialize();

    // Load aircraft
    this.jsbsim.loadAircraft("c172p");

    // Initialize after loading
    const fdm = this.jsbsim.getFDM();
    fdm.runIC();

    // Run a few steps to initialize
    for (let i = 0; i < 10; i++) {
      fdm.run();
    }

    // Initialize propulsion
    fdm.getPropulsion().initRunning(-1);

    // Start engine
    this.jsbsim.startAllEngines();
  }

  update(deltaTime) {
    // Run simulation
    this.jsbsim.getFDM().run();

    // Get flight data
    const position = this.jsbsim.getPosition();
    const attitude = this.jsbsim.getAttitude();

    // Update your game objects
    this.updateAircraft(position, attitude);
  }
}
```

### Method 3: Webpack/Bundler Integration

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: "asset/resource",
      },
      {
        test: /\.data$/,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    fallback: {
      fs: false,
      path: false,
    },
  },
};
```

```javascript
// In your game
import JSBSimModule from "./libs/jsbsim/jsbsim.js";
import "./libs/jsbsim/jsbsim.bundle.js";

// The WASM and data files will be handled by webpack
```

## Quick Start Example

```javascript
// Minimal flight game integration
class FlightGame {
  constructor() {
    this.jsbsim = null;
    this.aircraft = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { pitch: 0, roll: 0, yaw: 0 },
    };
  }

  async init() {
    // Initialize JSBSim
    window.JSBSimModule = await import("./libs/jsbsim/jsbsim.js");
    this.jsbsim = await JSBSim.create();
    await this.jsbsim.initialize();

    // Load Cessna 172
    this.jsbsim.loadAircraft("c172p");

    // Initialize systems
    const fdm = this.jsbsim.getFDM();
    fdm.runIC();
    for (let i = 0; i < 10; i++) fdm.run();
    fdm.getPropulsion().initRunning(-1);

    // Start engine
    this.jsbsim.startAllEngines();
    this.jsbsim.setAllThrottles(0.7);

    // Start game loop
    this.animate();
  }

  handleInput() {
    // Map your game controls to JSBSim
    if (keys.up) this.jsbsim.setElevator(-0.5);
    if (keys.down) this.jsbsim.setElevator(0.5);
    if (keys.left) this.jsbsim.setAileron(-0.5);
    if (keys.right) this.jsbsim.setAileron(0.5);
  }

  update() {
    // Run physics
    this.jsbsim.getFDM().run();

    // Get aircraft state
    const pos = this.jsbsim.getPosition();
    const att = this.jsbsim.getAttitude();

    // Convert to your coordinate system
    this.aircraft.position.x = pos.longitude;
    this.aircraft.position.y = pos.altitude;
    this.aircraft.position.z = pos.latitude;

    this.aircraft.rotation.pitch = (att.pitch * Math.PI) / 180;
    this.aircraft.rotation.roll = (att.roll * Math.PI) / 180;
    this.aircraft.rotation.yaw = (att.yaw * Math.PI) / 180;
  }

  animate() {
    this.handleInput();
    this.update();
    this.render();
    requestAnimationFrame(() => this.animate());
  }

  render() {
    // Your rendering code
  }
}

// Start the game
const game = new FlightGame();
game.init();
```

## Available Aircraft

The included aircraft in jsbsim.data:

- `c172p` - Cessna 172 (Easy, stable)
- `c172r` - Cessna 172R variant
- `c172x` - Cessna 172 experimental
- `p51d` - P-51D Mustang (Fighter, complex)
- `f16` - F-16 Fighting Falcon (Jet fighter)
- `f15` - F-15 Eagle (Jet fighter)
- `737` - Boeing 737 (Airliner)
- `A320` - Airbus A320 (Airliner)
- And many more...

## File Size Optimization

If you want to reduce file size:

1. **Remove unused aircraft** from jsbsim.data
2. **Use compression** (gzip reduces by ~60%)
3. **Load aircraft dynamically** instead of bundling all

## CDN Hosting

You can host the large files on a CDN:

```javascript
window.Module = {
  locateFile: (path) => {
    if (path.endsWith(".wasm")) {
      return "https://cdn.yourgame.com/jsbsim/" + path;
    }
    if (path.endsWith(".data")) {
      return "https://cdn.yourgame.com/jsbsim/" + path;
    }
    return path;
  },
};
```

## Performance Tips

1. **Run physics at 60Hz max**: `setInterval(() => fdm.run(), 16)`
2. **Batch data reads**: Read all properties once per frame
3. **Consider Web Worker**: For complex games
4. **Cache frequently used values**: Don't call getters repeatedly

TypeScript Usage:

The Only Required Files:

your-game/
├── src/
│ └── lib/
│ └── jsbsim.ts # The TypeScript source (index.ts)
└── public/
├── jsbsim.js # WASM loader (required)
├── jsbsim.wasm # WASM binary (required)
└── jsbsim.data # Aircraft data (required)

Even Simpler: Import Everything as TypeScript

You could even import the WASM loader as a TypeScript module:

// jsbsim-loader.ts
declare const JSBSimModule: any;

export async function loadJSBSim() {
// Dynamically import the WASM module
const module = await import('/jsbsim.js');
(window as any).JSBSimModule = module.default;

    // Import the JSBSim class (TypeScript)
    const { JSBSim } = await import('./lib/jsbsim');

    return JSBSim;

}

// In your game
import { loadJSBSim } from './jsbsim-loader';

const JSBSim = await loadJSBSim();
const jsbsim = await JSBSim.create();
