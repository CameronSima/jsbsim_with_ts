/**
 * JSBSim Flight Controls Demo
 *
 * This example demonstrates the aircraft control wrapper methods,
 * showing how to control an aircraft using the high-level API.
 */

const { JSBSim } = require('../dist/index.js');

async function flightControlsDemo() {
    console.log('Starting JSBSim Flight Controls Demo...');

    try {
        // Create and initialize JSBSim
        const jsbsim = new JSBSim();
        await jsbsim.init({
            rootDir: './jsbsim-data'
        });

        // Load aircraft
        console.log('Loading aircraft...');
        if (!jsbsim.loadAircraft('c172x')) {
            console.error('Failed to load aircraft');
            return;
        }

        // Initialize with takeoff conditions
        const fdm = jsbsim.getFDM();

        // Set initial conditions
        jsbsim.setProperty('ic/h-sl-ft', 1000);    // 1000 ft altitude
        jsbsim.setProperty('ic/vc-kts', 80);       // 80 knots airspeed
        jsbsim.setProperty('ic/gamma-deg', 0);     // Level flight

        // Initialize
        fdm.runIC();
        console.log('Aircraft initialized for level flight');

        // Start engines
        console.log('Starting engines...');
        jsbsim.startAllEngines();
        jsbsim.setAllThrottles(0.8); // 80% throttle

        console.log('Running flight controls demonstration...');

        // Simulate a series of control inputs
        for (let t = 0; t < 60; t += 0.1) {
            // Step the simulation
            if (!jsbsim.step()) {
                console.error('Simulation failed');
                break;
            }

            // Demonstrate various control inputs
            const time = jsbsim.getTime();

            if (time < 10) {
                // First 10 seconds: gentle climb
                jsbsim.setElevator(-0.1);
                jsbsim.setAllThrottles(0.9);

            } else if (time < 20) {
                // 10-20 seconds: level off
                jsbsim.setElevator(0.05);
                jsbsim.setAllThrottles(0.75);

            } else if (time < 30) {
                // 20-30 seconds: gentle right turn
                jsbsim.setAileron(0.2);
                jsbsim.setRudder(0.1);
                jsbsim.setElevator(0.02);

            } else if (time < 40) {
                // 30-40 seconds: level wings, reduce power
                jsbsim.setAileron(0);
                jsbsim.setRudder(0);
                jsbsim.setElevator(0);
                jsbsim.setAllThrottles(0.6);

            } else if (time < 50) {
                // 40-50 seconds: deploy flaps, configure for approach
                jsbsim.setFlaps(0.5);
                jsbsim.setAllThrottles(0.5);
                jsbsim.setElevator(0.1);

            } else {
                // 50-60 seconds: final approach configuration
                jsbsim.setFlaps(1.0);
                jsbsim.setLandingGear(1.0);
                jsbsim.setAllThrottles(0.4);
                jsbsim.setElevator(0.15);
            }

            // Log data every 2 seconds
            if (Math.abs(time % 2.0) < 0.1) {
                const state = jsbsim.getAircraftState();
                const controls = {
                    elevator: jsbsim.getElevatorPosition(),
                    aileron: jsbsim.getAileronPosition(),
                    rudder: jsbsim.getRudderPosition(),
                    flaps: jsbsim.getFlapsPosition(),
                    gear: jsbsim.getLandingGearPosition(),
                    throttle: state.controls.throttle[0]
                };

                console.log(`Time: ${time.toFixed(1)}s`);
                console.log(`  Position: ${state.position.altitude.toFixed(0)}ft, ` +
                           `${state.velocity.airspeed.toFixed(0)}kts, ` +
                           `hdg ${state.attitude.yaw.toFixed(0)}°`);
                console.log(`  Controls: elev=${controls.elevator.toFixed(2)}, ` +
                           `ail=${controls.aileron.toFixed(2)}, ` +
                           `rud=${controls.rudder.toFixed(2)}, ` +
                           `flaps=${controls.flaps.toFixed(2)}, ` +
                           `gear=${controls.gear.toFixed(2)}, ` +
                           `thr=${controls.throttle.toFixed(2)}`);
                console.log(`  Engine: thrust=${state.engines[0].thrust.toFixed(0)}lbs, ` +
                           `running=${state.engines[0].running}`);
                console.log(`  Ground: onGround=${state.gear.onGround}, ` +
                           `AGL=${jsbsim.getAltitudeAGL().toFixed(0)}ft`);
                console.log('');
            }
        }

        // Final state summary
        console.log('=== Final Aircraft State ===');
        const finalState = jsbsim.getAircraftState();

        console.log('Position:');
        console.log(`  Latitude: ${finalState.position.latitude.toFixed(6)}°`);
        console.log(`  Longitude: ${finalState.position.longitude.toFixed(6)}°`);
        console.log(`  Altitude: ${finalState.position.altitude.toFixed(0)} ft MSL`);
        console.log(`  AGL: ${jsbsim.getAltitudeAGL().toFixed(0)} ft`);

        console.log('Attitude:');
        console.log(`  Roll: ${finalState.attitude.roll.toFixed(1)}°`);
        console.log(`  Pitch: ${finalState.attitude.pitch.toFixed(1)}°`);
        console.log(`  Heading: ${finalState.attitude.yaw.toFixed(1)}°`);

        console.log('Velocity:');
        console.log(`  Ground Speed: ${finalState.velocity.groundSpeed.toFixed(1)} fps`);
        console.log(`  Airspeed: ${finalState.velocity.airspeed.toFixed(1)} kts`);
        console.log(`  Mach: ${finalState.velocity.mach.toFixed(3)}`);

        console.log('Angular Rates:');
        const rates = jsbsim.getAngularRates();
        console.log(`  Roll Rate: ${rates.rollRate.toFixed(2)}°/s`);
        console.log(`  Pitch Rate: ${rates.pitchRate.toFixed(2)}°/s`);
        console.log(`  Yaw Rate: ${rates.yawRate.toFixed(2)}°/s`);

        console.log('Aerodynamics:');
        console.log(`  Angle of Attack: ${jsbsim.getAngleOfAttack().toFixed(2)}°`);
        console.log(`  Sideslip: ${jsbsim.getSideslipAngle().toFixed(2)}°`);
        console.log(`  Dynamic Pressure: ${jsbsim.getDynamicPressure().toFixed(1)} psf`);

        console.log('Forces:');
        const aeroForces = jsbsim.getAerodynamicForces();
        const propForces = jsbsim.getPropulsionForces();
        console.log(`  Aero Forces: X=${aeroForces.x.toFixed(0)}, ` +
                   `Y=${aeroForces.y.toFixed(0)}, Z=${aeroForces.z.toFixed(0)} lbs`);
        console.log(`  Prop Forces: X=${propForces.x.toFixed(0)}, ` +
                   `Y=${propForces.y.toFixed(0)}, Z=${propForces.z.toFixed(0)} lbs`);

        console.log('Atmosphere:');
        const atmo = jsbsim.getAtmosphericConditions();
        const wind = jsbsim.getWindComponents();
        console.log(`  Temperature: ${(atmo.temperature - 459.67).toFixed(1)}°F`);
        console.log(`  Pressure: ${atmo.pressure.toFixed(1)} psf`);
        console.log(`  Density: ${atmo.density.toFixed(6)} slugs/ft³`);
        console.log(`  Wind: N=${wind.north.toFixed(1)}, E=${wind.east.toFixed(1)}, ` +
                   `D=${wind.down.toFixed(1)} fps`);

        console.log('Fuel:');
        console.log(`  Total Fuel: ${jsbsim.getTotalFuel().toFixed(1)} lbs`);
        console.log(`  Fuel Flow: ${jsbsim.getFuelFlowRate(0).toFixed(2)} gph`);

        console.log('\nFlight controls demonstration completed successfully!');

    } catch (error) {
        console.error('Demo failed:', error.message);
    }
}

// Demonstrate specific control scenarios
async function controlScenarios() {
    console.log('\n=== Control Scenarios Demo ===');

    const jsbsim = new JSBSim();
    try {
        await jsbsim.init();
        if (!jsbsim.loadAircraft('c172x')) {
            throw new Error('Failed to load aircraft');
        }

        // Scenario 1: Emergency procedures
        console.log('\nScenario 1: Engine failure simulation');
        jsbsim.startAllEngines();
        console.log(`Engines started: ${jsbsim.isEngineRunning(0)}`);

        jsbsim.stopAllEngines();
        console.log(`Engine shutdown: ${jsbsim.isEngineRunning(0)}`);
        console.log(`Thrust after shutdown: ${jsbsim.getEngineThrust(0).toFixed(0)} lbs`);

        // Scenario 2: Landing gear operations
        console.log('\nScenario 2: Landing gear cycling');
        console.log(`Initial gear position: ${jsbsim.getLandingGearPosition()}`);
        console.log(`Gear down: ${jsbsim.isLandingGearDown()}`);
        console.log(`Gear up: ${jsbsim.isLandingGearUp()}`);

        jsbsim.setLandingGear(0.0); // Retract
        console.log(`After retraction command: ${jsbsim.getLandingGearPosition()}`);

        jsbsim.setLandingGear(1.0); // Extend
        console.log(`After extension command: ${jsbsim.getLandingGearPosition()}`);

        // Scenario 3: Control surface deflections
        console.log('\nScenario 3: Control surface test');

        jsbsim.setElevator(0.5);
        jsbsim.setAileron(-0.3);
        jsbsim.setRudder(0.2);
        jsbsim.setFlaps(0.75);

        console.log(`Elevator position: ${jsbsim.getElevatorPosition().toFixed(2)}`);
        console.log(`Aileron position: ${jsbsim.getAileronPosition().toFixed(2)}`);
        console.log(`Rudder position: ${jsbsim.getRudderPosition().toFixed(2)}`);
        console.log(`Flaps position: ${jsbsim.getFlapsPosition().toFixed(2)}`);

        // Scenario 4: Brake test
        console.log('\nScenario 4: Brake and steering test');
        jsbsim.setBrakes(0.8);
        jsbsim.setSteering(0.3);

        console.log('Brakes applied and steering input set');

        console.log('\nControl scenarios completed!');

    } catch (error) {
        console.error('Control scenarios failed:', error.message);
    }
}

// Run the demos
if (require.main === module) {
    async function runAllDemos() {
        await flightControlsDemo();
        await controlScenarios();
    }

    runAllDemos().catch(console.error);
}

module.exports = { flightControlsDemo, controlScenarios };