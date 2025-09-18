
// Auto-generated declaration for JSBSim WASM module
declare module './jsbsim' {
    import { EmscriptenModule } from 'emscripten';

    interface JSBSimWasmModule extends EmscriptenModule {
        // Add any additional WASM-specific declarations here
    }

    const JSBSimModuleFactory: () => Promise<JSBSimWasmModule>;
    export default JSBSimModuleFactory;
}
