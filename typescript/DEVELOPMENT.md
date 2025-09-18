# JSBSim TypeScript Development Guide

## Quick Start

### Running the Browser Example

The fastest way to see JSBSim TypeScript bindings in action:

```bash
npm run example
```

This command will:
1. Build the TypeScript bindings (development mode)
2. Start a local development server
3. Automatically open the browser example at http://localhost:8080

### Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run example` | Build and serve browser example (recommended) |
| `npm run dev` | Same as `example` - build and serve |
| `npm run build:dev` | Build TypeScript only (skip WebAssembly) |
| `npm run serve` | Start development server only |
| `npm run build:wasm` | Build WebAssembly module (requires Emscripten) |
| `npm run build:bindings` | Build TypeScript bindings (requires WASM) |
| `npm run build` | Full build (WASM + TypeScript) |
| `npm test` | Run test suite |
| `npm run clean` | Clean build artifacts |

## Development Workflow

### 1. Basic Development (No WebAssembly)

For working on the TypeScript interface without needing the actual JSBSim simulation:

```bash
# Build and serve the example
npm run example

# Or step by step:
npm run build:dev  # Build TypeScript with stubs
npm run serve      # Start development server
```

The browser example will load but show WebAssembly initialization errors. This is expected and allows you to:
- Test the TypeScript interface
- Work on UI components
- Verify API methods exist
- Test error handling

### 2. Full Development (With WebAssembly)

For complete functionality with actual JSBSim simulation:

```bash
# First, ensure Emscripten is installed
# Follow: https://emscripten.org/docs/getting_started/downloads.html

# Build WebAssembly module (one-time setup)
npm run build:wasm

# Build and serve with full functionality
npm run example
```

### 3. File Watching and Auto-Reload

The development server doesn't include automatic file watching. For active development:

```bash
# Terminal 1: Start the server
npm run serve

# Terminal 2: Rebuild on changes (manual)
npm run build:dev
```

Or use a file watcher like `nodemon`:

```bash
npm install -g nodemon

# Watch TypeScript files and rebuild
nodemon --watch src --ext ts --exec "npm run build:dev"
```

## Development Server Features

The development server (`npm run serve`) provides:

### 🌐 Static File Serving
- Serves all project files from the TypeScript directory
- Supports all common file types with proper MIME types
- Automatic directory listings

### 🔧 WebAssembly Support
- Proper MIME type for `.wasm` files (`application/wasm`)
- CORS headers for cross-origin requests
- Cache control headers for development

### 🛡️ Security Headers
- Cross-Origin-Embedder-Policy for SharedArrayBuffer support
- Cross-Origin-Opener-Policy for isolation
- CORS headers for development

### 📱 Browser Integration
- Automatically opens browser on supported platforms
- Responsive design for mobile testing
- Error handling for missing files

## Directory Structure

```
typescript/
├── src/                    # TypeScript source code
│   ├── index.ts           # Main JSBSim class and interfaces
│   ├── jsbsim_binding.cpp # C++ WebAssembly bindings
│   └── pre.js             # Emscripten pre-initialization
├── examples/              # Usage examples
│   ├── browser-example.html      # Interactive browser demo
│   ├── basic-simulation.js       # Node.js basic example
│   └── flight-controls-demo.js   # Advanced controls demo
├── tests/                 # Test suites
│   ├── jsbsim.test.ts            # Core functionality tests
│   └── aircraft-controls.test.ts # Control wrapper tests
├── scripts/               # Build and development scripts
│   ├── build-bindings.js         # TypeScript build script
│   └── dev-server.js             # Development server
├── dist/                  # Build output (generated)
├── build/                 # WebAssembly build (generated)
└── node_modules/          # Dependencies
```

## Browser Example Features

### 🎮 Interactive Controls
- Real-time flight control sliders (elevator, aileron, rudder, throttle, flaps)
- Engine start/stop buttons
- Landing gear toggle
- Manual property input

### 📊 Live Data Display
- Aircraft position and attitude
- Velocity and performance data
- Angular rates and aerodynamic information
- Engine status and fuel data
- Control surface positions

### 🔧 Development Tools
- Console output logging
- Property system access
- Error handling and display
- Real-time data updates

## Troubleshooting

### WebAssembly Module Errors

**Error**: "JSBSim WebAssembly module not built"

**Solution**:
```bash
# Install Emscripten if not already installed
# Then build the WebAssembly module
npm run build:wasm
```

### TypeScript Compilation Errors

**Error**: TypeScript compilation fails

**Solutions**:
```bash
# Clean and rebuild
npm run clean
npm install
npm run build:dev

# Check TypeScript version
npx tsc --version  # Should be 5.x

# Verify Node.js version
node --version     # Should be 16+
```

### Development Server Issues

**Error**: "Port already in use"

**Solution**:
```bash
# Use different port
PORT=3000 npm run serve

# Or kill existing process
lsof -ti:8080 | xargs kill
```

**Error**: "CORS errors in browser"

The development server automatically sets CORS headers. If you still see CORS errors:
- Ensure you're accessing via `http://localhost:8080`, not file://
- Check browser console for specific error details
- Try a different browser or incognito mode

### Missing Aircraft Data

**Error**: "Failed to load aircraft"

The browser example requires aircraft data files. In production, you would:
1. Load aircraft XML files into the virtual file system
2. Use the `loadDataFiles()` method
3. Ensure correct file paths in the virtual filesystem

**Development workaround**:
The example shows the API working even without aircraft data. Initialization will fail gracefully and demonstrate error handling.

## Performance Optimization

### Development Mode
- Uses stub WebAssembly module (faster loading)
- No aircraft data loading (reduced memory)
- Simplified error messages

### Production Mode
```bash
# Full optimized build
npm run build

# Minified and optimized output in dist/
```

### Browser Performance
- Monitor memory usage in long-running simulations
- Use `requestAnimationFrame` for smooth animations
- Consider throttling simulation updates for better UI performance

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test aircraft-controls.test.ts

# Watch mode for development
npm test -- --watch
```

### Test Structure
- **Unit tests**: Individual method functionality
- **Integration tests**: Component interactions
- **Error handling tests**: Proper error states
- **API consistency tests**: Interface compliance

## Production Deployment

### Building for Production
```bash
# Full production build
npm run build

# Output files:
# dist/index.js          - Main module
# dist/index.d.ts        - TypeScript declarations
# dist/jsbsim.js         - WebAssembly loader
# dist/jsbsim.wasm       - WebAssembly binary
# dist/jsbsim.bundle.js  - Browser bundle
```

### Web Server Configuration

For production deployment, ensure your web server:

1. **Serves WASM with correct MIME type**:
   ```
   application/wasm    wasm
   ```

2. **Sets security headers**:
   ```
   Cross-Origin-Embedder-Policy: require-corp
   Cross-Origin-Opener-Policy: same-origin
   ```

3. **Enables compression**:
   ```
   # Compress .wasm files (can reduce size by 60%+)
   gzip on;
   gzip_types application/wasm;
   ```

4. **Sets appropriate caching**:
   ```
   # Cache WASM files
   location ~* \.wasm$ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

## Contributing

### Code Style
- Follow existing TypeScript conventions
- Use meaningful variable names
- Add JSDoc comments for public methods
- Maintain test coverage above 90%

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Build successfully: `npm run build`
6. Submit pull request with clear description

### Development Tips
- Use the browser example for visual testing
- Test both Node.js and browser environments
- Verify WebAssembly integration works correctly
- Check TypeScript type definitions are accurate
- Test error handling paths