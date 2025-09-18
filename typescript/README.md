# JSBSim JavaScript/TypeScript Bindings

This directory contains JavaScript/TypeScript bindings for JSBSim that enable running flight dynamics simulations in web browsers or Node.js environments through WebAssembly.

## Overview

JSBSim is compiled to WebAssembly using Emscripten, providing a JavaScript API that closely mirrors the Python bindings. The implementation uses:

- **Emscripten**: Compiles C++ JSBSim code to WebAssembly
- **Embind**: Provides C++ to JavaScript binding layer
- **TypeScript**: Type-safe JavaScript interface
- **Virtual File System**: Loads aircraft data files in browser

## Architecture

The TypeScript bindings follow the same structure as the Python bindings:

```
Python (Cython)          TypeScript (Emscripten)
├── jsbsim.pxd           ├── jsbsim_binding.cpp
├── jsbsim.pyx.in        ├── index.ts
└── JSBSim.py            └── examples/
```

## Key Components

### 1. C++ Binding Layer (`src/jsbsim_binding.cpp`)
- Wraps JSBSim C++ classes using Emscripten Embind
- Provides JavaScript-friendly interfaces
- Handles memory management and type conversions

### 2. TypeScript Interface (`src/index.ts`)
- Type definitions for all JSBSim classes
- High-level wrapper class for easier usage
- Error handling and browser compatibility

### 3. Build System
- CMake configuration for Emscripten
- TypeScript compilation
- Browser bundle generation

## Building

### Prerequisites

1. **Emscripten SDK**: Follow [installation instructions](https://emscripten.org/docs/getting_started/downloads.html)
2. **Node.js**: Version 16 or higher
3. **CMake**: Version 3.20 or higher

### Build Steps

```bash
# Install dependencies
npm install

# Build WebAssembly module
npm run build:wasm

# Build TypeScript bindings
npm run build:bindings

# Or build everything
npm run build
```

### Build Output

The build process generates:
- `dist/jsbsim.js` - Emscripten-generated JavaScript
- `dist/jsbsim.wasm` - WebAssembly binary
- `dist/index.js` - Compiled TypeScript module
- `dist/index.d.ts` - TypeScript declarations
- `dist/jsbsim.bundle.js` - Browser-compatible bundle

## Usage

### Node.js

```javascript
const { JSBSim } = require('jsbsim-js');

async function runSimulation() {
    const jsbsim = new JSBSim();

    await jsbsim.init({
        rootDir: './jsbsim-data'
    });

    jsbsim.loadAircraft('c172x');
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

    // Load aircraft data through virtual file system
    const aircraftData = await fetch('./aircraft/c172x.xml');
    jsbsim.getModule().loadDataFiles([{
        path: '/aircraft/c172x.xml',
        data: new Uint8Array(await aircraftData.arrayBuffer())
    }]);

    jsbsim.loadAircraft('c172x');
    // ... simulation code
}
</script>
```

### TypeScript

```typescript
import { JSBSim, JSBSimConfig } from 'jsbsim-js';

const config: JSBSimConfig = {
    rootDir: './jsbsim-data',
    aircraftPath: './aircraft',
    enginePath: './engine'
};

const jsbsim = new JSBSim();
await jsbsim.init(config);

// Type-safe property access
const altitude: number = jsbsim.getProperty('position/h-sl-ft');
jsbsim.setProperty('controls/flight/elevator', -0.1);

// Access to low-level FDM
const fdm = jsbsim.getFDM();
const propulsion = fdm.getPropulsion();
const numEngines = propulsion.getNumEngines();
```

## API Reference

### JSBSim Class

The main high-level interface:

- `init(config?)`: Initialize the WebAssembly module
- `loadAircraft(name)`: Load an aircraft model
- `step()`: Execute one simulation step
- `run(duration, realTime?)`: Run simulation for specified duration
- `getProperty(name)`: Get property value
- `setProperty(name, value)`: Set property value
- `reset()`: Reset to initial conditions

### FGFDMExec Interface

Low-level Flight Dynamics Model Executive:

- `run()`: Execute one simulation frame
- `loadModel(model)`: Load aircraft model
- `getPropertyValue(property)`: Get property value
- `setPropertyValue(property, value)`: Set property value
- `getPropulsion()`: Get propulsion system
- `getAerodynamics()`: Get aerodynamics model
- `getAtmosphere()`: Get atmosphere model
- And many more...

## Examples

### Basic Simulation
See `examples/basic-simulation.js` for a complete Node.js example.

### Browser Integration
See `examples/browser-example.html` for a web-based simulation interface.

### Aircraft Data Loading
```javascript
// Load aircraft files into virtual file system
const files = [
    { path: '/aircraft/c172x.xml', data: c172xData },
    { path: '/engine/eng_io360c.xml', data: engineData },
    { path: '/systems/electrical.xml', data: electricalData }
];

jsbsim.getModule().loadDataFiles(files);
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Differences from Python Bindings

1. **Asynchronous Initialization**: WebAssembly loading is asynchronous
2. **Virtual File System**: Aircraft data must be loaded into memory
3. **Browser Compatibility**: Additional considerations for web deployment
4. **Memory Management**: Automatic through JavaScript garbage collection
5. **Error Handling**: JavaScript exceptions instead of Python exceptions

## Performance Considerations

- **WASM Loading**: Initial module loading takes time (~100-500ms)
- **File System**: Virtual file system has memory overhead
- **Real-time Simulation**: Use `requestAnimationFrame` for smooth browser animations
- **Memory Usage**: Monitor memory growth in long-running simulations

## Browser Compatibility

- **Modern Browsers**: Chrome 57+, Firefox 52+, Safari 11+, Edge 16+
- **WebAssembly**: Required, widely supported
- **SharedArrayBuffer**: Optional, for threading support
- **File API**: For loading aircraft data files

## Troubleshooting

### Common Issues

1. **Module Loading Fails**
   - Ensure WASM files are served with correct MIME types
   - Check browser console for CORS errors
   - Verify Emscripten build completed successfully

2. **Aircraft Loading Fails**
   - Ensure aircraft data files are loaded into virtual file system
   - Check file paths match expected JSBSim structure
   - Verify XML files are valid

3. **Property Errors**
   - Use `queryPropertyCatalog()` to find available properties
   - Check property names for typos
   - Ensure model is loaded before accessing properties

### Debugging

```javascript
// Enable JSBSim debug output
const fdm = jsbsim.getFDM();
fdm.setDebugLevel(1);

// Print available properties
fdm.printPropertyCatalog();

// Query specific properties
const props = fdm.queryPropertyCatalog('position');
console.log(props);
```

## Contributing

When contributing to the TypeScript bindings:

1. Follow the Python bindings API as closely as possible
2. Add comprehensive TypeScript type definitions
3. Include browser compatibility considerations
4. Add tests for new functionality
5. Update documentation and examples

## License

The JSBSim TypeScript bindings are released under the same license as JSBSim itself (LGPL-2.1).