/**
 * JSBSim JavaScript/TypeScript Bindings
 *
 * This module provides JavaScript/TypeScript bindings for the JSBSim flight dynamics model.
 * JSBSim is compiled to WebAssembly using Emscripten and can run in web browsers or Node.js.
 */
declare global {
    var JSBSimModule: (() => Promise<JSBSimModule>) | undefined;
}
declare const JSBSimModuleFactory: () => Promise<JSBSimModule>;
export interface JSBSimModule extends EmscriptenModule {
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
    loadDataFiles: (files: Array<{
        path: string;
        data: ArrayBuffer | Uint8Array;
    }>) => void;
    setupJSBSimPaths: (rootPath: string) => void;
}
export declare class BaseError extends Error {
    constructor(message: string);
}
export declare class TrimFailureError extends BaseError {
    constructor(message: string);
}
export declare class GeographicError extends BaseError {
    constructor(message: string);
}
export declare enum TemperatureUnit {
    NoTempUnit = 0,
    Fahrenheit = 1,
    Celsius = 2,
    Rankine = 3,
    Kelvin = 4
}
export declare enum PressureUnit {
    NoPressUnit = 0,
    PSF = 1,
    Millibars = 2,
    Pascals = 3,
    InchesHg = 4
}
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
    run(): boolean;
    runIC(): boolean;
    loadModel(model: string, addModelToPath?: boolean): boolean;
    loadScript(script: string, deltaT?: number, initfile?: string): boolean;
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
    getPropertyValue(property: string): number;
    setPropertyValue(property: string, value: number): void;
    getModelName(): string;
    queryPropertyCatalog(check: string): string;
    printPropertyCatalog(): void;
    setOutputDirectives(fname: string): boolean;
    setLoggingRate(rate: number): void;
    setOutputFileName(n: number, fname: string): boolean;
    getOutputFileName(n: number): string;
    disableOutput(): void;
    enableOutput(): void;
    doTrim(mode: number): void;
    hold(): void;
    resume(): void;
    holding(): boolean;
    resetToInitialConditions(mode?: number): void;
    printSimulationConfiguration(): void;
    setTrimStatus(status: boolean): void;
    getTrimStatus(): boolean;
    getSimTime(): number;
    getDeltaT(): number;
    suspendIntegration(): void;
    resumeIntegration(): void;
    integrationSuspended(): boolean;
    setSimTime(curTime: number): boolean;
    setDt(deltaT: number): void;
    incrTime(): number;
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
    dataFiles?: Array<{
        path: string;
        data: ArrayBuffer | Uint8Array;
    }>;
}
/**
 * High-level wrapper class for easier JSBSim usage
 */
export declare class JSBSim {
    private module;
    private fdm;
    /**
     * Initialize the JSBSim module
     */
    init(config?: JSBSimConfig): Promise<void>;
    /**
     * Get the FDM executive instance
     */
    getFDM(): FGFDMExec;
    /**
     * Get the WebAssembly module instance
     */
    getModule(): JSBSimModule;
    /**
     * Load an aircraft model
     */
    loadAircraft(aircraftName: string, addToPath?: boolean): boolean;
    /**
     * Load and run a script
     */
    runScript(scriptPath: string, deltaT?: number, initFile?: string): boolean;
    /**
     * Run a single simulation step
     */
    step(): boolean;
    /**
     * Run the simulation for a specified time duration
     */
    run(duration: number, realTime?: boolean): Promise<void>;
    /**
     * Get the current simulation time
     */
    getTime(): number;
    /**
     * Set a property value
     */
    setProperty(property: string, value: number): void;
    /**
     * Get a property value
     */
    getProperty(property: string): number;
    /**
     * Reset the simulation to initial conditions
     */
    reset(): void;
    /**
     * Set primary flight controls (normalized -1 to 1)
     */
    setElevator(value: number): void;
    setAileron(value: number): void;
    setRudder(value: number): void;
    /**
     * Set secondary flight controls (normalized 0 to 1)
     */
    setFlaps(value: number): void;
    setSpeedbrakes(value: number): void;
    setSpoilers(value: number): void;
    /**
     * Set trim controls (normalized -1 to 1)
     */
    setPitchTrim(value: number): void;
    setRollTrim(value: number): void;
    setYawTrim(value: number): void;
    /**
     * Set engine controls (normalized 0 to 1)
     */
    setThrottle(engineIndex: number, value: number): void;
    setMixture(engineIndex: number, value: number): void;
    setPropellerAdvance(engineIndex: number, value: number): void;
    /**
     * Set all engine throttles to the same value
     */
    setAllThrottles(value: number): void;
    /**
     * Set brake controls (normalized 0 to 1)
     */
    setLeftBrake(value: number): void;
    setRightBrake(value: number): void;
    setCenterBrake(value: number): void;
    setBrakes(value: number): void;
    /**
     * Set steering control (normalized -1 to 1)
     */
    setSteering(value: number): void;
    /**
     * Set landing gear control (normalized 0 to 1, 0=up, 1=down)
     */
    setLandingGear(value: number): void;
    /**
     * Get aircraft position
     */
    getPosition(): {
        latitude: number;
        longitude: number;
        altitude: number;
    };
    getLatitude(): number;
    getLongitude(): number;
    getAltitude(): number;
    getAltitudeAGL(): number;
    /**
     * Get aircraft attitude (Euler angles in degrees)
     */
    getAttitude(): {
        roll: number;
        pitch: number;
        yaw: number;
    };
    getRoll(): number;
    getPitch(): number;
    getHeading(): number;
    /**
     * Get aircraft velocities
     */
    getVelocity(): {
        u: number;
        v: number;
        w: number;
    };
    getGroundSpeed(): number;
    getCalibratedAirspeed(): number;
    getTrueAirspeed(): number;
    getMachNumber(): number;
    /**
     * Get angular rates (degrees per second)
     */
    getAngularRates(): {
        rollRate: number;
        pitchRate: number;
        yawRate: number;
    };
    getRollRate(): number;
    getPitchRate(): number;
    getYawRate(): number;
    /**
     * Get aerodynamic angles
     */
    getAngleOfAttack(): number;
    getSideslipAngle(): number;
    /**
     * Get dynamic pressure
     */
    getDynamicPressure(): number;
    /**
     * Get engine thrust for a specific engine (pounds)
     */
    getEngineThrust(engineIndex: number): number;
    /**
     * Get total thrust from all engines
     */
    getTotalThrust(): number;
    /**
     * Get fuel flow rate for a specific engine (gallons per hour)
     */
    getFuelFlowRate(engineIndex: number): number;
    /**
     * Get total fuel quantity (pounds)
     */
    getTotalFuel(): number;
    /**
     * Get engine running state
     */
    isEngineRunning(engineIndex: number): boolean;
    /**
     * Start/stop engine
     */
    setEngineRunning(engineIndex: number, running: boolean): void;
    /**
     * Start all engines
     */
    startAllEngines(): void;
    /**
     * Stop all engines
     */
    stopAllEngines(): void;
    /**
     * Get weight on wheels status
     */
    isOnGround(): boolean;
    /**
     * Get landing gear position (0=up, 1=down)
     */
    getLandingGearPosition(): number;
    /**
     * Check if landing gear is down and locked
     */
    isLandingGearDown(): boolean;
    /**
     * Check if landing gear is up and locked
     */
    isLandingGearUp(): boolean;
    /**
     * Get current control surface positions (normalized)
     */
    getElevatorPosition(): number;
    getAileronPosition(): number;
    getRudderPosition(): number;
    getFlapsPosition(): number;
    getSpeedbrakesPosition(): number;
    /**
     * Get atmospheric conditions
     */
    getAtmosphericConditions(): {
        temperature: number;
        pressure: number;
        density: number;
        windSpeed: number;
    };
    getWindComponents(): {
        north: number;
        east: number;
        down: number;
    };
    /**
     * Get aerodynamic forces (pounds)
     */
    getAerodynamicForces(): {
        x: number;
        y: number;
        z: number;
    };
    /**
     * Get aerodynamic moments (pound-feet)
     */
    getAerodynamicMoments(): {
        roll: number;
        pitch: number;
        yaw: number;
    };
    /**
     * Get propulsion forces (pounds)
     */
    getPropulsionForces(): {
        x: number;
        y: number;
        z: number;
    };
    /**
     * Get comprehensive aircraft state summary
     */
    getAircraftState(): {
        time: number;
        position: {
            latitude: number;
            longitude: number;
            altitude: number;
        };
        attitude: {
            roll: number;
            pitch: number;
            yaw: number;
        };
        velocity: {
            groundSpeed: number;
            airspeed: number;
            mach: number;
        };
        controls: {
            elevator: number;
            aileron: number;
            rudder: number;
            throttle: number[];
        };
        gear: {
            position: number;
            onGround: boolean;
        };
        engines: {
            running: boolean;
            thrust: number;
        }[];
    };
}
export { JSBSimModuleFactory };
