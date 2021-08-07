function consoleModuleLoader(modules) {
  modules['console.log'] = (args) => console.log(args)
  modules['console.error'] = (args) => console.error(args)
}

module.exports = consoleModuleLoader
