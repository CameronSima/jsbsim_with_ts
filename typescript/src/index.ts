/**
 * JSBSim JavaScript/TypeScript Bindings
 *
 * This module provides JavaScript/TypeScript bindings for the JSBSim flight dynamics model.
 * JSBSim is compiled to WebAssembly using Emscripten and can run in web browsers or Node.js.
 */

/// <reference types="emscripten" />

// JSBSim WebAssembly module factory - will be available after build
// For now, provide a stub implementation for testing
const JSBSimModuleFactory: () => Promise<JSBSimModule> = async () => {
  throw new Error('JSBSim WebAssembly module not available. Build the WASM module first.');
};

export interface JSBSimModule extends EmscriptenModule {
  // JSBSim-specific classes
  FGJSBBase: new () => FGJSBBase;
  FGFDMExec: new (rootDir?: string) => FGFDMExec;
  FGColumnVector3: new () => FGColumnVector3;
  FGMatrix33: new () => FGMatrix33;
  FGPropertyManager: new () => FGPropertyManager;
  FGInitialCondition: new () => FGInitialCondition;
  FGPropagate: new () => FGPropagate;
  FGPropulsion: new () => FGPropulsion;
  FGEngine: new () => FGEngine;
  FGAerodynamics: new () => FGAerodynamics;
  FGAircraft: new () => FGAircraft;
  FGAtmosphere: new () => FGAtmosphere;
  FGAuxiliary: new () => FGAuxiliary;
  FGLGear: new () => FGLGear;
  FGGroundReactions: new () => FGGroundReactions;
  FGMassBalance: new () => FGMassBalance;
  FGLinearization: new () => FGLinearization;

  // Helper functions
  loadDataFiles: (files: Array<{ path: string; data: ArrayBuffer | Uint8Array }>) => void;
  setupJSBSimPaths: (rootPath: string) => void;
}

// Base exception classes
export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BaseError';
  }
}

export class TrimFailureError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = 'TrimFailureError';
  }
}

export class GeographicError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = 'GeographicError';
  }
}

// Enums matching JSBSim C++ enums
export enum TemperatureUnit {
  NoTempUnit = 0,
  Fahrenheit = 1,
  Celsius = 2,
  Rankine = 3,
  Kelvin = 4
}

export enum PressureUnit {
  NoPressUnit = 0,
  PSF = 1,
  Millibars = 2,
  Pascals = 3,
  InchesHg = 4
}

// Interface definitions for JSBSim classes
export interface FGJSBBase {
  getVersion(): string;
  disableHighlighting(): void;
  getDebugLevel(): number;
  setDebugLevel(level: number): void;
}

export interface FGColumnVector3 {
  getEntry(index: number): number;
  toArray(): number[];
}

export interface FGMatrix33 {
  getEntry(row: number, col: number): number;
  toArray(): number[][];
}

export interface FGPropertyManager {
  hasNode(path: string): boolean;
}

export interface FGInitialCondition {
  load(rstfile: string, useAircraftPath: boolean): boolean;
}

export interface FGPropagate {
  getTl2b(): FGMatrix33;
  getTec2b(): FGMatrix33;
  getUVW(): FGColumnVector3;
}

export interface FGEngine {
  initRunning(): number;
}

export interface FGPropulsion {
  initRunning(n: number): void;
  getNumEngines(): number;
  getEngine(idx: number): FGEngine;
  getSteadyState(): boolean;
}

export interface FGAerodynamics {
  getMomentsMRC(): FGColumnVector3;
  getForces(): FGColumnVector3;
}

export interface FGAircraft {
  getAircraftName(): string;
  getXYZrp(): FGColumnVector3;
}

export interface FGAtmosphere {
  getTemperature(h: number): number;
  setTemperature(t: number, h: number, unit: TemperatureUnit): void;
  setPressureSL(unit: PressureUnit, pressure: number): void;
}

export interface FGAuxiliary {
  getTw2b(): FGMatrix33;
  getTb2w(): FGMatrix33;
}

export interface FGLGear {
  getSteerNorm(): number;
  getBodyXForce(): number;
  getBodyYForce(): number;
  getBodyZForce(): number;
  getLocation(): FGColumnVector3;
  getActingLocation(): FGColumnVector3;
}

export interface FGGroundReactions {
  getGearUnit(gear: number): FGLGear;
  getNumGearUnits(): number;
}

export interface FGMassBalance {
  getXYZcg(): FGColumnVector3;
  getJ(): FGMatrix33;
  getJinv(): FGMatrix33;
}

export interface FGLinearization {
  writeScicoslab(): void;
  writeScicoslabWithPath(path: string): void;
  getSystemMatrix(): number[][];
  getInputMatrix(): number[][];
  getOutputMatrix(): number[][];
}

/**
 * Main JSBSim Flight Dynamics Model Executive
 *
 * This is the primary interface for JSBSim simulations.
 * All other simulation classes are instantiated and managed through this class.
 */
export interface FGFDMExec extends FGJSBBase {
  // Core simulation methods
  run(): boolean;
  runIC(): boolean;
  loadModel(model: string, addModelToPath?: boolean): boolean;
  loadScript(script: string, deltaT?: number, initfile?: string): boolean;

  // Path management
  setEnginePath(path: string): boolean;
  setAircraftPath(path: string): boolean;
  setSystemsPath(path: string): boolean;
  setOutputPath(path: string): boolean;
  setRootDir(path: string): void;
  getEnginePath(): string;
  getAircraftPath(): string;
  getSystemsPath(): string;
  getOutputPath(): string;
  getRootDir(): string;

  // Property system
  getPropertyValue(property: string): number;
  setPropertyValue(property: string, value: number): void;
  getModelName(): string;
  queryPropertyCatalog(check: string): string;
  printPropertyCatalog(): void;

  // Output and logging
  setOutputDirectives(fname: string): boolean;
  setLoggingRate(rate: number): void;
  setOutputFileName(n: number, fname: string): boolean;
  getOutputFileName(n: number): string;
  disableOutput(): void;
  enableOutput(): void;

  // Trim and simulation control
  doTrim(mode: number): void;
  hold(): void;
  resume(): void;
  holding(): boolean;
  resetToInitialConditions(mode?: number): void;
  printSimulationConfiguration(): void;
  setTrimStatus(status: boolean): void;
  getTrimStatus(): boolean;

  // Time management
  getSimTime(): number;
  getDeltaT(): number;
  suspendIntegration(): void;
  resumeIntegration(): void;
  integrationSuspended(): boolean;
  setSimTime(curTime: number): boolean;
  setDt(deltaT: number): void;
  incrTime(): number;

  // Model access
  getPropulsion(): FGPropulsion;
  getIC(): FGInitialCondition;
  getPropagate(): FGPropagate;
  getPropertyManager(): FGPropertyManager;
  getGroundReactions(): FGGroundReactions;
  getAuxiliary(): FGAuxiliary;
  getAerodynamics(): FGAerodynamics;
  getAircraft(): FGAircraft;
  getAtmosphere(): FGAtmosphere;
  getMassBalance(): FGMassBalance;
  getLinearization(): FGLinearization;

  // Additional methods
  getPropulsionTankReport(): string;
}

/**
 * Configuration options for JSBSim initialization
 */
export interface JSBSimConfig {
  rootDir?: string;
  aircraftPath?: string;
  enginePath?: string;
  systemsPath?: string;
  outputPath?: string;
  dataFiles?: Array<{ path: string; data: ArrayBuffer | Uint8Array }>;
}

/**
 * High-level wrapper class for easier JSBSim usage
 */
export class JSBSim {
  private module: JSBSimModule | null = null;
  private fdm: FGFDMExec | null = null;

  /**
   * Initialize the JSBSim module
   */
  async init(config: JSBSimConfig = {}): Promise<void> {
    try {
      this.module = await JSBSimModuleFactory();

      // Set up virtual file system if data files are provided
      if (config.dataFiles && config.dataFiles.length > 0) {
        this.module!.loadDataFiles(config.dataFiles);
      }

      // Set up paths
      if (config.rootDir) {
        this.module!.setupJSBSimPaths(config.rootDir);
      }

      // Create FDM executive
      this.fdm = new this.module!.FGFDMExec(config.rootDir || '');

      // Configure paths
      if (config.aircraftPath) {
        this.fdm.setAircraftPath(config.aircraftPath);
      }
      if (config.enginePath) {
        this.fdm.setEnginePath(config.enginePath);
      }
      if (config.systemsPath) {
        this.fdm.setSystemsPath(config.systemsPath);
      }
      if (config.outputPath) {
        this.fdm.setOutputPath(config.outputPath);
      }

    } catch (error) {
      throw new BaseError(`Failed to initialize JSBSim: ${error}`);
    }
  }

  /**
   * Get the FDM executive instance
   */
  getFDM(): FGFDMExec {
    if (!this.fdm) {
      throw new BaseError('JSBSim not initialized. Call init() first.');
    }
    return this.fdm;
  }

  /**
   * Get the WebAssembly module instance
   */
  getModule(): JSBSimModule {
    if (!this.module) {
      throw new BaseError('JSBSim not initialized. Call init() first.');
    }
    return this.module;
  }

  /**
   * Load an aircraft model
   */
  loadAircraft(aircraftName: string, addToPath: boolean = true): boolean {
    if (!this.fdm) {
      throw new BaseError('JSBSim not initialized. Call init() first.');
    }
    return this.fdm.loadModel(aircraftName, addToPath);
  }

  /**
   * Load and run a script
   */
  runScript(scriptPath: string, deltaT: number = 0.0, initFile: string = ''): boolean {
    if (!this.fdm) {
      throw new BaseError('JSBSim not initialized. Call init() first.');
    }
    return this.fdm.loadScript(scriptPath, deltaT, initFile);
  }

  /**
   * Run a single simulation step
   */
  step(): boolean {
    if (!this.fdm) {
      throw new BaseError('JSBSim not initialized. Call init() first.');
    }
    return this.fdm.run();
  }

  /**
   * Run the simulation for a specified time duration
   */
  async run(duration: number, realTime: boolean = false): Promise<void> {
    if (!this.fdm) {
      throw new BaseError('JSBSim not initialized. Call init() first.');
    }

    const startTime = this.fdm.getSimTime();
    const endTime = startTime + duration;
    const deltaT = this.fdm.getDeltaT();

    while (this.fdm.getSimTime() < endTime) {
      if (!this.fdm.run()) {
        break;
      }

      if (realTime) {
        // Sleep for real-time simulation
        await new Promise(resolve => setTimeout(resolve, deltaT * 1000));
      }
    }
  }

  /**
   * Get the current simulation time
   */
  getTime(): number {
    if (!this.fdm) {
      throw new BaseError('JSBSim not initialized. Call init() first.');
    }
    return this.fdm.getSimTime();
  }

  /**
   * Set a property value
   */
  setProperty(property: string, value: number): void {
    if (!this.fdm) {
      throw new BaseError('JSBSim not initialized. Call init() first.');
    }
    this.fdm.setPropertyValue(property, value);
  }

  /**
   * Get a property value
   */
  getProperty(property: string): number {
    if (!this.fdm) {
      throw new BaseError('JSBSim not initialized. Call init() first.');
    }
    return this.fdm.getPropertyValue(property);
  }

  /**
   * Reset the simulation to initial conditions
   */
  reset(): void {
    if (!this.fdm) {
      throw new BaseError('JSBSim not initialized. Call init() first.');
    }
    this.fdm.resetToInitialConditions();
  }

  // ========================================================================
  // Aircraft Control Methods
  // ========================================================================

  /**
   * Set primary flight controls (normalized -1 to 1)
   */
  setElevator(value: number): void {
    this.setProperty('fcs/elevator-cmd-norm', value);
  }

  setAileron(value: number): void {
    this.setProperty('fcs/aileron-cmd-norm', value);
  }

  setRudder(value: number): void {
    this.setProperty('fcs/rudder-cmd-norm', value);
  }

  /**
   * Set secondary flight controls (normalized 0 to 1)
   */
  setFlaps(value: number): void {
    this.setProperty('fcs/flap-cmd-norm', value);
  }

  setSpeedbrakes(value: number): void {
    this.setProperty('fcs/speedbrake-cmd-norm', value);
  }

  setSpoilers(value: number): void {
    this.setProperty('fcs/spoiler-cmd-norm', value);
  }

  /**
   * Set trim controls (normalized -1 to 1)
   */
  setPitchTrim(value: number): void {
    this.setProperty('fcs/pitch-trim-cmd-norm', value);
  }

  setRollTrim(value: number): void {
    this.setProperty('fcs/roll-trim-cmd-norm', value);
  }

  setYawTrim(value: number): void {
    this.setProperty('fcs/yaw-trim-cmd-norm', value);
  }

  /**
   * Set engine controls (normalized 0 to 1)
   */
  setThrottle(engineIndex: number, value: number): void {
    this.setProperty(`fcs/throttle-cmd-norm[${engineIndex}]`, value);
  }

  setMixture(engineIndex: number, value: number): void {
    this.setProperty(`fcs/mixture-cmd-norm[${engineIndex}]`, value);
  }

  setPropellerAdvance(engineIndex: number, value: number): void {
    this.setProperty(`fcs/advance-cmd-norm[${engineIndex}]`, value);
  }

  /**
   * Set all engine throttles to the same value
   */
  setAllThrottles(value: number): void {
    const propulsion = this.getFDM().getPropulsion();
    const numEngines = propulsion.getNumEngines();
    for (let i = 0; i < numEngines; i++) {
      this.setThrottle(i, value);
    }
  }

  /**
   * Set brake controls (normalized 0 to 1)
   */
  setLeftBrake(value: number): void {
    this.setProperty('fcs/left-brake-cmd-norm', value);
  }

  setRightBrake(value: number): void {
    this.setProperty('fcs/right-brake-cmd-norm', value);
  }

  setCenterBrake(value: number): void {
    this.setProperty('fcs/center-brake-cmd-norm', value);
  }

  setBrakes(value: number): void {
    this.setLeftBrake(value);
    this.setRightBrake(value);
  }

  /**
   * Set steering control (normalized -1 to 1)
   */
  setSteering(value: number): void {
    this.setProperty('fcs/steer-cmd-norm', value);
  }

  /**
   * Set landing gear control (normalized 0 to 1, 0=up, 1=down)
   */
  setLandingGear(value: number): void {
    this.setProperty('gear/gear-cmd-norm', value);
  }

  // ========================================================================
  // Aircraft State Getter Methods
  // ========================================================================

  /**
   * Get aircraft position
   */
  getPosition(): { latitude: number; longitude: number; altitude: number } {
    return {
      latitude: this.getProperty('position/lat-gc-deg'),
      longitude: this.getProperty('position/long-gc-deg'),
      altitude: this.getProperty('position/h-sl-ft')
    };
  }

  getLatitude(): number {
    return this.getProperty('position/lat-gc-deg');
  }

  getLongitude(): number {
    return this.getProperty('position/long-gc-deg');
  }

  getAltitude(): number {
    return this.getProperty('position/h-sl-ft');
  }

  getAltitudeAGL(): number {
    return this.getProperty('position/h-agl-ft');
  }

  /**
   * Get aircraft attitude (Euler angles in degrees)
   */
  getAttitude(): { roll: number; pitch: number; yaw: number } {
    return {
      roll: this.getProperty('attitude/phi-deg'),
      pitch: this.getProperty('attitude/theta-deg'),
      yaw: this.getProperty('attitude/psi-deg')
    };
  }

  getRoll(): number {
    return this.getProperty('attitude/phi-deg');
  }

  getPitch(): number {
    return this.getProperty('attitude/theta-deg');
  }

  getHeading(): number {
    return this.getProperty('attitude/psi-deg');
  }

  /**
   * Get aircraft velocities
   */
  getVelocity(): { u: number; v: number; w: number } {
    return {
      u: this.getProperty('velocities/u-fps'),
      v: this.getProperty('velocities/v-fps'),
      w: this.getProperty('velocities/w-fps')
    };
  }

  getGroundSpeed(): number {
    return this.getProperty('velocities/vg-fps');
  }

  getCalibratedAirspeed(): number {
    return this.getProperty('velocities/vc-kts');
  }

  getTrueAirspeed(): number {
    return this.getProperty('velocities/vtrue-kts');
  }

  getMachNumber(): number {
    return this.getProperty('velocities/mach');
  }

  /**
   * Get angular rates (degrees per second)
   */
  getAngularRates(): { rollRate: number; pitchRate: number; yawRate: number } {
    return {
      rollRate: this.getProperty('velocities/p-rad_sec') * 180 / Math.PI,
      pitchRate: this.getProperty('velocities/q-rad_sec') * 180 / Math.PI,
      yawRate: this.getProperty('velocities/r-rad_sec') * 180 / Math.PI
    };
  }

  getRollRate(): number {
    return this.getProperty('velocities/p-rad_sec') * 180 / Math.PI;
  }

  getPitchRate(): number {
    return this.getProperty('velocities/q-rad_sec') * 180 / Math.PI;
  }

  getYawRate(): number {
    return this.getProperty('velocities/r-rad_sec') * 180 / Math.PI;
  }

  /**
   * Get aerodynamic angles
   */
  getAngleOfAttack(): number {
    return this.getProperty('aero/alpha-deg');
  }

  getSideslipAngle(): number {
    return this.getProperty('aero/beta-deg');
  }

  /**
   * Get dynamic pressure
   */
  getDynamicPressure(): number {
    return this.getProperty('aero/qbar-psf');
  }

  // ========================================================================
  // Engine State Methods
  // ========================================================================

  /**
   * Get engine thrust for a specific engine (pounds)
   */
  getEngineThrust(engineIndex: number): number {
    return this.getProperty(`propulsion/engine[${engineIndex}]/thrust-lbs`);
  }

  /**
   * Get total thrust from all engines
   */
  getTotalThrust(): number {
    const propulsion = this.getFDM().getPropulsion();
    const numEngines = propulsion.getNumEngines();
    let totalThrust = 0;
    for (let i = 0; i < numEngines; i++) {
      totalThrust += this.getEngineThrust(i);
    }
    return totalThrust;
  }

  /**
   * Get fuel flow rate for a specific engine (gallons per hour)
   */
  getFuelFlowRate(engineIndex: number): number {
    return this.getProperty(`propulsion/engine[${engineIndex}]/fuel-flow-rate-gph`);
  }

  /**
   * Get total fuel quantity (pounds)
   */
  getTotalFuel(): number {
    return this.getProperty('propulsion/total-fuel-lbs');
  }

  /**
   * Get engine running state
   */
  isEngineRunning(engineIndex: number): boolean {
    return this.getProperty(`propulsion/engine[${engineIndex}]/set-running`) > 0;
  }

  /**
   * Start/stop engine
   */
  setEngineRunning(engineIndex: number, running: boolean): void {
    this.setProperty(`propulsion/engine[${engineIndex}]/set-running`, running ? 1 : 0);
  }

  /**
   * Start all engines
   */
  startAllEngines(): void {
    const propulsion = this.getFDM().getPropulsion();
    const numEngines = propulsion.getNumEngines();
    for (let i = 0; i < numEngines; i++) {
      this.setEngineRunning(i, true);
    }
  }

  /**
   * Stop all engines
   */
  stopAllEngines(): void {
    const propulsion = this.getFDM().getPropulsion();
    const numEngines = propulsion.getNumEngines();
    for (let i = 0; i < numEngines; i++) {
      this.setEngineRunning(i, false);
    }
  }

  // ========================================================================
  // Landing Gear and Ground Contact Methods
  // ========================================================================

  /**
   * Get weight on wheels status
   */
  isOnGround(): boolean {
    return this.getProperty('gear/wow') > 0;
  }

  /**
   * Get landing gear position (0=up, 1=down)
   */
  getLandingGearPosition(): number {
    return this.getProperty('gear/gear-pos-norm');
  }

  /**
   * Check if landing gear is down and locked
   */
  isLandingGearDown(): boolean {
    return this.getLandingGearPosition() > 0.99;
  }

  /**
   * Check if landing gear is up and locked
   */
  isLandingGearUp(): boolean {
    return this.getLandingGearPosition() < 0.01;
  }

  // ========================================================================
  // Control Surface Position Getters
  // ========================================================================

  /**
   * Get current control surface positions (normalized)
   */
  getElevatorPosition(): number {
    return this.getProperty('fcs/elevator-pos-norm');
  }

  getAileronPosition(): number {
    return this.getProperty('fcs/aileron-cmd-norm'); // Use command as position may vary L/R
  }

  getRudderPosition(): number {
    return this.getProperty('fcs/rudder-pos-norm');
  }

  getFlapsPosition(): number {
    return this.getProperty('fcs/flap-pos-norm');
  }

  getSpeedbrakesPosition(): number {
    return this.getProperty('fcs/speedbrake-pos-norm');
  }

  // ========================================================================
  // Atmospheric Conditions
  // ========================================================================

  /**
   * Get atmospheric conditions
   */
  getAtmosphericConditions(): {
    temperature: number;
    pressure: number;
    density: number;
    windSpeed: number;
  } {
    return {
      temperature: this.getProperty('atmosphere/T-R'), // Rankine
      pressure: this.getProperty('atmosphere/P-psf'), // psf
      density: this.getProperty('atmosphere/rho-slugs_ft3'), // slugs/ft³
      windSpeed: this.getProperty('atmosphere/wind-mag-fps') // fps
    };
  }

  getWindComponents(): { north: number; east: number; down: number } {
    return {
      north: this.getProperty('atmosphere/wind-north-fps'),
      east: this.getProperty('atmosphere/wind-east-fps'),
      down: this.getProperty('atmosphere/wind-down-fps')
    };
  }

  // ========================================================================
  // Forces and Moments
  // ========================================================================

  /**
   * Get aerodynamic forces (pounds)
   */
  getAerodynamicForces(): { x: number; y: number; z: number } {
    return {
      x: this.getProperty('forces/fbx-aero-lbs'),
      y: this.getProperty('forces/fby-aero-lbs'),
      z: this.getProperty('forces/fbz-aero-lbs')
    };
  }

  /**
   * Get aerodynamic moments (pound-feet)
   */
  getAerodynamicMoments(): { roll: number; pitch: number; yaw: number } {
    return {
      roll: this.getProperty('moments/l-aero-lbsft'),
      pitch: this.getProperty('moments/m-aero-lbsft'),
      yaw: this.getProperty('moments/n-aero-lbsft')
    };
  }

  /**
   * Get propulsion forces (pounds)
   */
  getPropulsionForces(): { x: number; y: number; z: number } {
    return {
      x: this.getProperty('forces/fbx-prop-lbs'),
      y: this.getProperty('forces/fby-prop-lbs'),
      z: this.getProperty('forces/fbz-prop-lbs')
    };
  }

  // ========================================================================
  // Convenience Methods
  // ========================================================================

  /**
   * Get comprehensive aircraft state summary
   */
  getAircraftState(): {
    time: number;
    position: { latitude: number; longitude: number; altitude: number };
    attitude: { roll: number; pitch: number; yaw: number };
    velocity: { groundSpeed: number; airspeed: number; mach: number };
    controls: {
      elevator: number;
      aileron: number;
      rudder: number;
      throttle: number[];
    };
    gear: { position: number; onGround: boolean };
    engines: { running: boolean; thrust: number }[];
  } {
    const propulsion = this.getFDM().getPropulsion();
    const numEngines = propulsion.getNumEngines();

    const throttles: number[] = [];
    const engines: { running: boolean; thrust: number }[] = [];

    for (let i = 0; i < numEngines; i++) {
      throttles.push(this.getProperty(`fcs/throttle-pos-norm[${i}]`));
      engines.push({
        running: this.isEngineRunning(i),
        thrust: this.getEngineThrust(i)
      });
    }

    return {
      time: this.getTime(),
      position: this.getPosition(),
      attitude: this.getAttitude(),
      velocity: {
        groundSpeed: this.getGroundSpeed(),
        airspeed: this.getCalibratedAirspeed(),
        mach: this.getMachNumber()
      },
      controls: {
        elevator: this.getElevatorPosition(),
        aileron: this.getAileronPosition(),
        rudder: this.getRudderPosition(),
        throttle: throttles
      },
      gear: {
        position: this.getLandingGearPosition(),
        onGround: this.isOnGround()
      },
      engines: engines
    };
  }
}

// Export the JSBSim module factory
export { JSBSimModuleFactory };