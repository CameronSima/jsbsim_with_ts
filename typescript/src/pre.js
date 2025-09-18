// Pre-initialization JavaScript for JSBSim WebAssembly module
// This runs before the WASM module is loaded

// Set up virtual file system for aircraft data if needed
Module.preRun = Module.preRun || [];
Module.preRun.push(function() {
    // Create virtual directories for JSBSim data
    FS.mkdir('/aircraft');
    FS.mkdir('/engine');
    FS.mkdir('/systems');
    FS.mkdir('/scripts');

    console.log('JSBSim WebAssembly module initialized');
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