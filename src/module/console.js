function consoleModuleLoader(moduleCallbacks) {
  moduleCallbacks['console.log'] = ({ args }) => console.log(...args)
  moduleCallbacks['console.error'] = ({ args }) => console.error(...args)
}

module.exports = consoleModuleLoader
