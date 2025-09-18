// Pre-initialization JavaScript for JSBSim WebAssembly module
// This runs before the WASM module is loaded

// Set up virtual file system for aircraft data if needed
Module.postRun = Module.postRun || [];
Module.postRun.push(function() {
    // Check data directories after Emscripten has finished initialization
    // This runs after preloaded files are mounted
    try {
        const hasAircraft = FS.analyzePath('/aircraft').exists;
        const hasEngine = FS.analyzePath('/engine').exists;
        const hasSystems = FS.analyzePath('/systems').exists;
        const hasScripts = FS.analyzePath('/scripts').exists;

        console.log('JSBSim data directories status (post-init):');
        console.log('  /aircraft:', hasAircraft ? 'exists' : 'missing');
        console.log('  /engine:', hasEngine ? 'exists' : 'missing');
        console.log('  /systems:', hasSystems ? 'exists' : 'missing');
        console.log('  /scripts:', hasScripts ? 'exists' : 'missing');

        if (hasAircraft) {
            // List some aircraft files as verification
            try {
                const aircraftList = FS.readdir('/aircraft');
                console.log('Available aircraft:', aircraftList.slice(0, 10)); // Show first 10
            } catch (e) {
                console.warn('Could not list aircraft directory:', e.message);
            }
        }
    } catch (e) {
        console.warn('Could not check data directories:', e.message);
    }

    console.log('JSBSim WebAssembly module initialized with data');
});

// Helper function to load aircraft data files
Module.loadDataFiles = function(files) {
    files.forEach(file => {
        if (file.path && file.data) {
            const dirPath = file.path.substring(0, file.path.lastIndexOf('/'));
            FS.mkdirTree(dirPath);
            FS.writeFile(file.path, file.data);
        }
    });
};

// Helper function to set JSBSim data paths
Module.setupJSBSimPaths = function(rootPath) {
    if (rootPath) {
        // Mount the root path in the virtual file system
        FS.mkdirTree(rootPath);
        FS.chdir(rootPath);
    }
};