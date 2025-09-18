# JSBSim JavaScript/TypeScript Bindings

This package contains the compiled JavaScript/TypeScript bindings for JSBSim flight dynamics model.

## Usage

### Node.js
```javascript
const { JSBSim } = require('jsbsim-js');

async function runSimulation() {
    const jsbsim = new JSBSim();
    await jsbsim.init({
        rootDir: '/path/to/jsbsim/data'
    });

    // Load an aircraft
    jsbsim.loadAircraft('c172x');

    // Run simulation
    await jsbsim.run(10.0); // Run for 10 seconds
}
```

### Browser
```html
<script src="jsbsim.bundle.js"></script>
<script>
async function runSimulation() {
    const jsbsim = new JSBSim();
    await jsbsim.init();

    // Your simulation code here
}
</script>
```

## Files

- `index.js` - Main module (Node.js)
- `index.d.ts` - TypeScript declarations
- `jsbsim.bundle.js` - Browser-compatible bundle
- `jsbsim.js` - Emscripten-generated JavaScript
- `jsbsim.wasm` - WebAssembly binary
- `jsbsim.d.ts` - WASM module declarations
