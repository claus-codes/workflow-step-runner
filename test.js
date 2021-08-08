const YAML = require('yaml')
const fs = require('fs')

const { processAssignValuesRecursive, processInlineCodeRecursive } = require('./src/util/inline-code')
const { createWorkflowFromConfig } = require('./src/util/config-processor')

function loadModule(name, callbacks) {
  const moduleLoader = require(`./src/module/${name}`)
  moduleLoader(callbacks)
}

const callbacks = {}
loadModule('console', callbacks)
loadModule('http', callbacks)

const FILE = 'test.yaml'
const workflowConfig = YAML.parse(fs.readFileSync(FILE, 'utf-8'))

const workflow = createWorkflowFromConfig(workflowConfig)
console.log(JSON.stringify(workflow, null, 2))

executeWorkflow(workflow)
  .then(() => console.log('Done'))
  .catch(error => console.error(error))

async function executeWorkflow(workflow) {
  let stepName = workflow.stepIndex[0]
  const start = Date.now()
  while (stepName) {
    const step = workflow.stepDictionary[stepName]
    const nextStep = await executeStep(step, workflow.vars)
    stepName = nextStep || step.next || workflow.stepIndex[workflow.stepIndex.indexOf(stepName) + 1]
  }
  const executionTimeInSeconds = (Date.now() - start) / 1000
  console.log(`Workflow execution finished. Total time elapsed: ${executionTimeInSeconds} seconds.`)
}

async function executeStep(step, vars) {
  console.log(`Running step "${step.__name}"`)
  const start = Date.now()
  let nextStep

  if (step.assign) {
    processAssignValuesRecursive(step.assign, vars)
  }
  else {
    processInlineCodeRecursive(step, vars)
  }
  if (step.switch) {
    // TODO
  }
  else if (step.call) {
    nextStep = await callbacks[step.call](step, vars)
  }

  //console.log(`Vars after "${step.__name}"`, vars)

  const executionTimeInSeconds = (Date.now() - start) / 1000
  console.log(`Step execution finished. Time elapsed: ${executionTimeInSeconds} seconds.`)
  return nextStep
}
