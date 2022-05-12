function noopModuleLoader(moduleCallbacks) {
  moduleCallbacks['noop'] = () => {}
}

module.exports = noopModuleLoader
