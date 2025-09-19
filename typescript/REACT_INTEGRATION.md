# JSBSim React + TypeScript Integration Guide

## Installation

### Step 1: Copy JSBSim files to your React project

```bash
# In your React project root
mkdir -p public/jsbsim
cp path/to/jsbsim/dist/jsbsim.js public/jsbsim/
cp path/to/jsbsim/dist/jsbsim.wasm public/jsbsim/
cp path/to/jsbsim/dist/jsbsim.data public/jsbsim/

# Copy TypeScript files to src
mkdir -p src/lib/jsbsim
cp path/to/jsbsim/dist/jsbsim.bundle.js src/lib/jsbsim/
cp path/to/jsbsim/dist/jsbsim.d.ts src/lib/jsbsim/
```

## TypeScript Type Definitions

### Create `src/lib/jsbsim/types.ts`:

```typescript
// Type definitions for JSBSim
export interface Position {
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface Attitude {
  roll: number;
  pitch: number;
  yaw: number;
}

export interface Velocity {
  north: number;
  east: number;
  down: number;
}

export interface AngularRates {
  rollRate: number;
  pitchRate: number;
  yawRate: number;
}

export interface EngineData {
  running: boolean;
  rpm: number;
  thrust: number;
  powerHP: number;
  fuelFlow: number;
}

export interface JSBSimModule {
  JSBSim: any;
  FGFDMExec: any;
}

declare global {
  interface Window {
    JSBSimModule: () => Promise<JSBSimModule>;
    JSBSim: any;
  }
}
```

## React Hook for JSBSim

### Create `src/hooks/useJSBSim.ts`:

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Position, Attitude, Velocity, EngineData } from '../lib/jsbsim/types';

interface JSBSimState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  aircraftLoaded: boolean;
  position: Position | null;
  attitude: Attitude | null;
  velocity: Velocity | null;
  engineData: EngineData | null;
  simulationTime: number;
}

interface UseJSBSimReturn extends JSBSimState {
  initialize: () => Promise<void>;
  loadAircraft: (aircraft: string) => Promise<boolean>;
  startEngine: () => void;
  stopEngine: () => void;
  setThrottle: (value: number) => void;
  setElevator: (value: number) => void;
  setAileron: (value: number) => void;
  setRudder: (value: number) => void;
  runSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
}

export function useJSBSim(): UseJSBSimReturn {
  const [state, setState] = useState<JSBSimState>({
    initialized: false,
    loading: false,
    error: null,
    aircraftLoaded: false,
    position: null,
    attitude: null,
    velocity: null,
    engineData: null,
    simulationTime: 0,
  });

  const jsbsimRef = useRef<any>(null);
  const fdmRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  const isRunningRef = useRef(false);

  // Initialize JSBSim
  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Load the WebAssembly module
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = `
        import JSBSimModule from '/jsbsim/jsbsim.js';
        window.JSBSimModule = JSBSimModule;
      `;
      document.head.appendChild(script);

      // Wait for module to be available
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load the bundle
      await import('../lib/jsbsim/jsbsim.bundle.js');

      // Create JSBSim instance
      if (window.JSBSim) {
        jsbsimRef.current = await window.JSBSim.create();
        await jsbsimRef.current.initialize();
        fdmRef.current = jsbsimRef.current.getFDM();

        setState(prev => ({
          ...prev,
          initialized: true,
          loading: false,
        }));
      } else {
        throw new Error('JSBSim not available');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize JSBSim',
      }));
    }
  }, []);

  // Load aircraft
  const loadAircraft = useCallback(async (aircraft: string): Promise<boolean> => {
    if (!jsbsimRef.current || !fdmRef.current) {
      setState(prev => ({ ...prev, error: 'JSBSim not initialized' }));
      return false;
    }

    try {
      const loaded = jsbsimRef.current.loadAircraft(aircraft);

      if (loaded) {
        // Initialize aircraft systems
        fdmRef.current.runIC();

        // Run several steps to stabilize
        for (let i = 0; i < 10; i++) {
          fdmRef.current.run();
        }

        // Initialize propulsion
        const propulsion = fdmRef.current.getPropulsion();
        propulsion.initRunning(-1);

        setState(prev => ({
          ...prev,
          aircraftLoaded: true,
          error: null,
        }));

        return true;
      }

      setState(prev => ({ ...prev, error: `Failed to load aircraft: ${aircraft}` }));
      return false;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load aircraft',
      }));
      return false;
    }
  }, []);

  // Update simulation data
  const updateSimulationData = useCallback(() => {
    if (!jsbsimRef.current) return;

    try {
      setState(prev => ({
        ...prev,
        position: jsbsimRef.current.getPosition(),
        attitude: jsbsimRef.current.getAttitude(),
        velocity: jsbsimRef.current.getVelocity(),
        engineData: {
          running: jsbsimRef.current.isEngineRunning(0),
          rpm: jsbsimRef.current.getEngineRPM(0),
          thrust: jsbsimRef.current.getEngineThrust(0),
          powerHP: jsbsimRef.current.getEnginePowerHP(0),
          fuelFlow: jsbsimRef.current.getEngineFuelFlow(0),
        },
        simulationTime: jsbsimRef.current.getTime(),
      }));
    } catch (error) {
      console.error('Error updating simulation data:', error);
    }
  }, []);

  // Simulation loop
  const simulationLoop = useCallback(() => {
    if (!isRunningRef.current || !fdmRef.current) return;

    fdmRef.current.run();
    updateSimulationData();

    animationFrameRef.current = requestAnimationFrame(simulationLoop);
  }, [updateSimulationData]);

  // Control functions
  const startEngine = useCallback(() => {
    if (jsbsimRef.current) {
      jsbsimRef.current.startAllEngines();
      updateSimulationData();
    }
  }, [updateSimulationData]);

  const stopEngine = useCallback(() => {
    if (jsbsimRef.current) {
      jsbsimRef.current.stopAllEngines();
      updateSimulationData();
    }
  }, [updateSimulationData]);

  const setThrottle = useCallback((value: number) => {
    if (jsbsimRef.current) {
      jsbsimRef.current.setAllThrottles(value);
    }
  }, []);

  const setElevator = useCallback((value: number) => {
    if (jsbsimRef.current) {
      jsbsimRef.current.setElevator(value);
    }
  }, []);

  const setAileron = useCallback((value: number) => {
    if (jsbsimRef.current) {
      jsbsimRef.current.setAileron(value);
    }
  }, []);

  const setRudder = useCallback((value: number) => {
    if (jsbsimRef.current) {
      jsbsimRef.current.setRudder(value);
    }
  }, []);

  const runSimulation = useCallback(() => {
    isRunningRef.current = true;
    simulationLoop();
  }, [simulationLoop]);

  const pauseSimulation = useCallback(() => {
    isRunningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const resetSimulation = useCallback(() => {
    if (fdmRef.current) {
      pauseSimulation();
      fdmRef.current.resetToInitialConditions();
      updateSimulationData();
    }
  }, [pauseSimulation, updateSimulationData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    ...state,
    initialize,
    loadAircraft,
    startEngine,
    stopEngine,
    setThrottle,
    setElevator,
    setAileron,
    setRudder,
    runSimulation,
    pauseSimulation,
    resetSimulation,
  };
}
```

## React Component Example

### Create `src/components/FlightSimulator.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import { useJSBSim } from '../hooks/useJSBSim';

const FlightSimulator: React.FC = () => {
  const jsbsim = useJSBSim();
  const [selectedAircraft, setSelectedAircraft] = useState('c172p');
  const [controls, setControls] = useState({
    throttle: 0.3,
    elevator: 0,
    aileron: 0,
    rudder: 0,
  });

  // Initialize on mount
  useEffect(() => {
    jsbsim.initialize();
  }, []);

  // Load aircraft after initialization
  useEffect(() => {
    if (jsbsim.initialized && !jsbsim.aircraftLoaded) {
      jsbsim.loadAircraft(selectedAircraft);
    }
  }, [jsbsim.initialized, selectedAircraft]);

  const handleControlChange = (control: string, value: number) => {
    setControls(prev => ({ ...prev, [control]: value }));

    switch (control) {
      case 'throttle':
        jsbsim.setThrottle(value);
        break;
      case 'elevator':
        jsbsim.setElevator(value);
        break;
      case 'aileron':
        jsbsim.setAileron(value);
        break;
      case 'rudder':
        jsbsim.setRudder(value);
        break;
    }
  };

  if (jsbsim.loading) {
    return <div className="loading">Loading JSBSim...</div>;
  }

  if (jsbsim.error) {
    return <div className="error">Error: {jsbsim.error}</div>;
  }

  return (
    <div className="flight-simulator">
      <div className="controls">
        <h2>Aircraft Controls</h2>

        <div className="control-group">
          <label>Aircraft:</label>
          <select
            value={selectedAircraft}
            onChange={(e) => setSelectedAircraft(e.target.value)}
            disabled={!jsbsim.initialized}
          >
            <option value="c172p">Cessna 172P</option>
            <option value="p51d">P-51D Mustang</option>
            <option value="f16">F-16 Fighting Falcon</option>
            <option value="737">Boeing 737</option>
          </select>
          <button onClick={() => jsbsim.loadAircraft(selectedAircraft)}>
            Load Aircraft
          </button>
        </div>

        <div className="control-group">
          <label>Engine:</label>
          <button onClick={jsbsim.startEngine}>Start Engine</button>
          <button onClick={jsbsim.stopEngine}>Stop Engine</button>
          {jsbsim.engineData && (
            <span className={jsbsim.engineData.running ? 'running' : 'stopped'}>
              {jsbsim.engineData.running ? 'Running' : 'Stopped'}
            </span>
          )}
        </div>

        <div className="control-group">
          <label>Throttle: {(controls.throttle * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={controls.throttle}
            onChange={(e) => handleControlChange('throttle', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Elevator: {(controls.elevator * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={controls.elevator}
            onChange={(e) => handleControlChange('elevator', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Aileron: {(controls.aileron * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={controls.aileron}
            onChange={(e) => handleControlChange('aileron', parseFloat(e.target.value))}
          />
        </div>

        <div className="simulation-controls">
          <button onClick={jsbsim.runSimulation}>Run</button>
          <button onClick={jsbsim.pauseSimulation}>Pause</button>
          <button onClick={jsbsim.resetSimulation}>Reset</button>
        </div>
      </div>

      <div className="flight-data">
        <h2>Flight Data</h2>

        {jsbsim.position && (
          <div className="data-section">
            <h3>Position</h3>
            <p>Latitude: {jsbsim.position.latitude.toFixed(6)}°</p>
            <p>Longitude: {jsbsim.position.longitude.toFixed(6)}°</p>
            <p>Altitude: {jsbsim.position.altitude.toFixed(1)} ft</p>
          </div>
        )}

        {jsbsim.attitude && (
          <div className="data-section">
            <h3>Attitude</h3>
            <p>Roll: {jsbsim.attitude.roll.toFixed(1)}°</p>
            <p>Pitch: {jsbsim.attitude.pitch.toFixed(1)}°</p>
            <p>Heading: {jsbsim.attitude.yaw.toFixed(1)}°</p>
          </div>
        )}

        {jsbsim.engineData && (
          <div className="data-section">
            <h3>Engine</h3>
            <p>RPM: {jsbsim.engineData.rpm.toFixed(0)}</p>
            <p>Power: {jsbsim.engineData.powerHP.toFixed(1)} HP</p>
            <p>Thrust: {jsbsim.engineData.thrust.toFixed(0)} lbs</p>
            <p>Fuel Flow: {jsbsim.engineData.fuelFlow.toFixed(1)} lbs/hr</p>
          </div>
        )}

        <div className="data-section">
          <h3>Simulation</h3>
          <p>Time: {jsbsim.simulationTime.toFixed(2)} seconds</p>
        </div>
      </div>
    </div>
  );
};

export default FlightSimulator;
```

## Three.js Integration Example

### Create `src/components/Flight3D.tsx`:

```tsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useJSBSim } from '../hooks/useJSBSim';

const Flight3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const aircraftRef = useRef<THREE.Mesh>();
  const jsbsim = useJSBSim();

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.set(0, 10, 30);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Create aircraft (simple box for now)
    const geometry = new THREE.BoxGeometry(2, 1, 6);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const aircraft = new THREE.Mesh(geometry, material);
    aircraftRef.current = aircraft;
    scene.add(aircraft);

    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update aircraft position and rotation from JSBSim
      if (aircraftRef.current && jsbsim.position && jsbsim.attitude) {
        // Convert JSBSim coordinates to Three.js coordinates
        aircraftRef.current.position.y = jsbsim.position.altitude * 0.01; // Scale down

        // Apply attitude
        aircraftRef.current.rotation.x = jsbsim.attitude.pitch * Math.PI / 180;
        aircraftRef.current.rotation.y = jsbsim.attitude.yaw * Math.PI / 180;
        aircraftRef.current.rotation.z = jsbsim.attitude.roll * Math.PI / 180;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [jsbsim.position, jsbsim.attitude]);

  useEffect(() => {
    // Initialize and load aircraft
    const init = async () => {
      await jsbsim.initialize();
      await jsbsim.loadAircraft('c172p');
      jsbsim.startEngine();
      jsbsim.setThrottle(0.7);
      jsbsim.runSimulation();
    };
    init();
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default Flight3D;
```

## App.tsx Integration

```tsx
import React from 'react';
import FlightSimulator from './components/FlightSimulator';
// or
// import Flight3D from './components/Flight3D';

function App() {
  return (
    <div className="App">
      <h1>JSBSim React Flight Simulator</h1>
      <FlightSimulator />
      {/* or <Flight3D /> for 3D view */}
    </div>
  );
}

export default App;
```

## Package.json Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "copy-jsbsim": "cp -r ../path/to/jsbsim/dist/* public/jsbsim/"
  }
}
```

## Environment Variables

Create `.env`:

```bash
# Optional: Use CDN for large files
REACT_APP_JSBSIM_CDN_URL=https://cdn.yourgame.com/jsbsim
```

## Next.js Support

For Next.js, create `pages/_app.tsx`:

```tsx
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Load JSBSim module globally
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import JSBSimModule from '/jsbsim/jsbsim.js';
      window.JSBSimModule = JSBSimModule;
    `;
    document.head.appendChild(script);
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

## Common Issues & Solutions

### 1. CORS Issues
If serving from different domain:
```typescript
window.JSBSimModule = () => {
  return import('/jsbsim/jsbsim.js').then(module => {
    return module.default({
      locateFile: (path: string) => {
        return `https://your-cdn.com/jsbsim/${path}`;
      }
    });
  });
};
```

### 2. TypeScript Errors
Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "allowJs": true,
    "skipLibCheck": true
  }
}
```

### 3. Webpack Configuration
Add to webpack config:
```javascript
module.exports = {
  resolve: {
    fallback: {
      "fs": false,
      "path": false
    }
  }
};
```