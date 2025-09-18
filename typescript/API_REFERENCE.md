# JSBSim JavaScript/TypeScript API Reference

## JSBSim Class

The `JSBSim` class provides a high-level interface to the JSBSim flight dynamics model with convenient wrapper methods for aircraft controls and state access.

### Core Methods

#### `init(config?: JSBSimConfig): Promise<void>`
Initialize the JSBSim WebAssembly module.

```typescript
const jsbsim = new JSBSim();
await jsbsim.init({
    rootDir: './jsbsim-data',
    aircraftPath: './aircraft',
    enginePath: './engine'
});
```

#### `loadAircraft(name: string, addToPath?: boolean): boolean`
Load an aircraft model.

```typescript
const success = jsbsim.loadAircraft('c172x');
```

#### `step(): boolean`
Execute one simulation step.

#### `run(duration: number, realTime?: boolean): Promise<void>`
Run simulation for specified duration.

## Aircraft Control Methods

### Primary Flight Controls

All primary controls accept normalized values from -1 to 1:

#### `setElevator(value: number): void`
Set elevator deflection.
- `value`: -1 (full up) to 1 (full down)

#### `setAileron(value: number): void`
Set aileron deflection.
- `value`: -1 (full left) to 1 (full right)

#### `setRudder(value: number): void`
Set rudder deflection.
- `value`: -1 (full left) to 1 (full right)

```typescript
// Gentle right turn
jsbsim.setAileron(0.2);
jsbsim.setRudder(0.1);
jsbsim.setElevator(0.02);
```

### Secondary Flight Controls

Controls accept normalized values from 0 to 1:

#### `setFlaps(value: number): void`
Set flap position.
- `value`: 0 (retracted) to 1 (fully extended)

#### `setSpeedbrakes(value: number): void`
Set speedbrake position.

#### `setSpoilers(value: number): void`
Set spoiler position.

```typescript
// Configure for landing
jsbsim.setFlaps(1.0);      // Full flaps
jsbsim.setSpeedbrakes(0.5); // Half speedbrakes
```

### Trim Controls

Trim controls accept normalized values from -1 to 1:

#### `setPitchTrim(value: number): void`
Set pitch trim.

#### `setRollTrim(value: number): void`
Set roll trim.

#### `setYawTrim(value: number): void`
Set yaw trim.

### Engine Controls

#### `setThrottle(engineIndex: number, value: number): void`
Set throttle for specific engine.
- `engineIndex`: Engine number (0-based)
- `value`: 0 (idle) to 1 (full power)

#### `setAllThrottles(value: number): void`
Set all engine throttles to same value.

#### `setMixture(engineIndex: number, value: number): void`
Set mixture for specific engine.

#### `setPropellerAdvance(engineIndex: number, value: number): void`
Set propeller advance for specific engine.

#### `setEngineRunning(engineIndex: number, running: boolean): void`
Start or stop specific engine.

#### `startAllEngines(): void`
Start all engines.

#### `stopAllEngines(): void`
Stop all engines.

```typescript
// Engine startup sequence
jsbsim.startAllEngines();
jsbsim.setAllThrottles(0.8);
jsbsim.setMixture(0, 0.9);
```

### Brake and Steering Controls

#### `setLeftBrake(value: number): void`
#### `setRightBrake(value: number): void`
#### `setCenterBrake(value: number): void`
Set individual brake controls (0 to 1).

#### `setBrakes(value: number): void`
Set both left and right brakes.

#### `setSteering(value: number): void`
Set nose wheel steering (-1 to 1).

### Landing Gear Controls

#### `setLandingGear(value: number): void`
Set landing gear position.
- `value`: 0 (retracted) to 1 (extended)

## Aircraft State Getter Methods

### Position

#### `getPosition(): { latitude: number; longitude: number; altitude: number }`
Get aircraft position.

#### `getLatitude(): number`
Get latitude in degrees.

#### `getLongitude(): number`
Get longitude in degrees.

#### `getAltitude(): number`
Get altitude above sea level in feet.

#### `getAltitudeAGL(): number`
Get altitude above ground level in feet.

```typescript
const pos = jsbsim.getPosition();
console.log(`Aircraft at ${pos.latitude.toFixed(6)}°, ${pos.longitude.toFixed(6)}°, ${pos.altitude.toFixed(0)}ft`);
```

### Attitude

#### `getAttitude(): { roll: number; pitch: number; yaw: number }`
Get aircraft attitude in degrees.

#### `getRoll(): number`
Get roll angle in degrees.

#### `getPitch(): number`
Get pitch angle in degrees.

#### `getHeading(): number`
Get heading in degrees.

### Velocity

#### `getVelocity(): { u: number; v: number; w: number }`
Get body frame velocities in fps.

#### `getGroundSpeed(): number`
Get ground speed in fps.

#### `getCalibratedAirspeed(): number`
Get calibrated airspeed in knots.

#### `getTrueAirspeed(): number`
Get true airspeed in knots.

#### `getMachNumber(): number`
Get Mach number.

### Angular Rates

#### `getAngularRates(): { rollRate: number; pitchRate: number; yawRate: number }`
Get angular rates in degrees per second.

#### `getRollRate(): number`
#### `getPitchRate(): number`
#### `getYawRate(): number`
Get individual angular rates in degrees per second.

### Aerodynamic Data

#### `getAngleOfAttack(): number`
Get angle of attack in degrees.

#### `getSideslipAngle(): number`
Get sideslip angle in degrees.

#### `getDynamicPressure(): number`
Get dynamic pressure in psf.

### Engine State

#### `getEngineThrust(engineIndex: number): number`
Get thrust for specific engine in pounds.

#### `getTotalThrust(): number`
Get total thrust from all engines.

#### `getFuelFlowRate(engineIndex: number): number`
Get fuel flow rate in gallons per hour.

#### `getTotalFuel(): number`
Get total fuel quantity in pounds.

#### `isEngineRunning(engineIndex: number): boolean`
Check if engine is running.

### Landing Gear State

#### `isOnGround(): boolean`
Check if aircraft has weight on wheels.

#### `getLandingGearPosition(): number`
Get landing gear position (0=up, 1=down).

#### `isLandingGearDown(): boolean`
Check if gear is down and locked.

#### `isLandingGearUp(): boolean`
Check if gear is up and locked.

### Control Surface Positions

#### `getElevatorPosition(): number`
#### `getAileronPosition(): number`
#### `getRudderPosition(): number`
#### `getFlapsPosition(): number`
#### `getSpeedbrakesPosition(): number`
Get current control surface positions (normalized).

### Atmospheric Conditions

#### `getAtmosphericConditions(): { temperature: number; pressure: number; density: number; windSpeed: number }`
Get atmospheric data.

#### `getWindComponents(): { north: number; east: number; down: number }`
Get wind components in fps.

### Forces and Moments

#### `getAerodynamicForces(): { x: number; y: number; z: number }`
Get aerodynamic forces in pounds.

#### `getAerodynamicMoments(): { roll: number; pitch: number; yaw: number }`
Get aerodynamic moments in pound-feet.

#### `getPropulsionForces(): { x: number; y: number; z: number }`
Get propulsion forces in pounds.

### Comprehensive State

#### `getAircraftState(): AircraftState`
Get comprehensive aircraft state summary including position, attitude, velocity, controls, engines, and gear status.

```typescript
const state = jsbsim.getAircraftState();
console.log(`Time: ${state.time}s`);
console.log(`Position: ${state.position.altitude}ft, ${state.velocity.airspeed}kts`);
console.log(`Engines: ${state.engines.map(e => e.running ? 'ON' : 'OFF').join(', ')}`);
```

## Property System

For advanced users, direct property access is still available:

#### `setProperty(property: string, value: number): void`
Set any JSBSim property by name.

#### `getProperty(property: string): number`
Get any JSBSim property by name.

```typescript
// Direct property access
jsbsim.setProperty('fcs/elevator-cmd-norm', -0.1);
const altitude = jsbsim.getProperty('position/h-sl-ft');
```

## Usage Examples

### Basic Flight

```typescript
const jsbsim = new JSBSim();
await jsbsim.init();
jsbsim.loadAircraft('c172x');

// Takeoff configuration
jsbsim.startAllEngines();
jsbsim.setAllThrottles(1.0);
jsbsim.setFlaps(0.3);

// Gentle climb
jsbsim.setElevator(-0.1);

// Monitor flight
setInterval(() => {
    const state = jsbsim.getAircraftState();
    console.log(`${state.position.altitude.toFixed(0)}ft, ${state.velocity.airspeed.toFixed(0)}kts`);
}, 1000);
```

### Emergency Procedures

```typescript
// Engine failure
jsbsim.stopAllEngines();
jsbsim.setAllThrottles(0.0);

// Best glide speed
jsbsim.setElevator(0.05); // Adjust for best glide

// Configure for emergency landing
jsbsim.setFlaps(1.0);
jsbsim.setLandingGear(1.0);
```

### Aerobatic Maneuvers

```typescript
// Barrel roll
for (let t = 0; t < 8; t += 0.1) {
    jsbsim.setAileron(Math.sin(t) * 0.8);
    jsbsim.setElevator(Math.cos(t) * 0.3);
    jsbsim.step();
}
```

## Error Handling

All wrapper methods throw `BaseError` if JSBSim is not initialized:

```typescript
try {
    jsbsim.setElevator(0.5);
} catch (error) {
    if (error instanceof BaseError) {
        console.error('JSBSim not initialized:', error.message);
    }
}
```

## Property Reference

The wrapper methods use these JSBSim properties internally:

### Flight Controls
- `fcs/elevator-cmd-norm` - Elevator command
- `fcs/aileron-cmd-norm` - Aileron command
- `fcs/rudder-cmd-norm` - Rudder command
- `fcs/flap-cmd-norm` - Flap command
- `fcs/throttle-cmd-norm[n]` - Throttle command for engine n

### Aircraft State
- `position/lat-gc-deg` - Latitude (degrees)
- `position/long-gc-deg` - Longitude (degrees)
- `position/h-sl-ft` - Altitude MSL (feet)
- `attitude/phi-deg` - Roll angle (degrees)
- `attitude/theta-deg` - Pitch angle (degrees)
- `attitude/psi-deg` - Yaw angle (degrees)
- `velocities/vc-kts` - Calibrated airspeed (knots)
- `velocities/p-rad_sec` - Roll rate (rad/s)
- `aero/alpha-deg` - Angle of attack (degrees)

See the full property reference in the main documentation for complete listings.