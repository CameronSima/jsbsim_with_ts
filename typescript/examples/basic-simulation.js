/**
 * Basic JSBSim simulation example (Node.js)
 *
 * This example demonstrates how to:
 * 1. Initialize JSBSim
 * 2. Load an aircraft model
 * 3. Run a simple simulation
 * 4. Read simulation data
 */

const { JSBSim } = require('../dist/index.js');

async function runBasicSimulation() {
    console.log('Starting basic JSBSim simulation...');

    try {
        // Create JSBSim instance
        const jsbsim = new JSBSim();

        // Initialize with configuration
        await jsbsim.init({
            rootDir: './jsbsim-data', // Path to JSBSim data files
            aircraftPath: './jsbsim-data/aircraft',
            enginePath: './jsbsim-data/engine',
            systemsPath: './jsbsim-data/systems'
        });

        console.log('JSBSim initialized successfully');

        // Load an aircraft (example: Cessna 172)
        const aircraftLoaded = jsbsim.loadAircraft('c172x');
        if (!aircraftLoaded) {
            console.error('Failed to load aircraft');
            return;
        }

        console.log('Aircraft loaded successfully');

        // Get the FDM for more detailed control
        const fdm = jsbsim.getFDM();

        // Print simulation configuration
        fdm.printSimulationConfiguration();

        // Set some initial conditions
        jsbsim.setProperty('ic/h-sl-ft', 5000); // Altitude: 5000 ft
        jsbsim.setProperty('ic/vc-kts', 120);   // Airspeed: 120 knots
        jsbsim.setProperty('ic/gamma-deg', 0);  // Flight path angle: 0 degrees

        // Initialize with initial conditions
        fdm.runIC();

        console.log('Initial conditions set');

        // Run simulation for 10 seconds
        console.log('Running simulation for 10 seconds...');

        const startTime = jsbsim.getTime();
        const endTime = startTime + 10.0;

        while (jsbsim.getTime() < endTime) {
            // Step the simulation
            if (!jsbsim.step()) {
                console.error('Simulation step failed');
                break;
            }

            // Read some properties every second
            const currentTime = jsbsim.getTime();
            if (Math.floor(currentTime) !== Math.floor(currentTime - fdm.getDeltaT())) {
                const altitude = jsbsim.getProperty('position/h-sl-ft');
                const airspeed = jsbsim.getProperty('velocities/vc-kts');
                const heading = jsbsim.getProperty('attitude/psi-deg');

                console.log(`Time: ${currentTime.toFixed(2)}s, ` +
                           `Altitude: ${altitude.toFixed(1)}ft, ` +
                           `Airspeed: ${airspeed.toFixed(1)}kts, ` +
                           `Heading: ${heading.toFixed(1)}°`);
            }
        }

        console.log('Simulation completed successfully');

        // Get final state
        const finalAltitude = jsbsim.getProperty('position/h-sl-ft');
        const finalAirspeed = jsbsim.getProperty('velocities/vc-kts');

        console.log(`Final state: Altitude: ${finalAltitude.toFixed(1)}ft, ` +
                   `Airspeed: ${finalAirspeed.toFixed(1)}kts`);

    } catch (error) {
        console.error('Simulation failed:', error.message);
    }
}

// Run the example
if (require.main === module) {
    runBasicSimulation().catch(console.error);
}

module.exports = { runBasicSimulation };