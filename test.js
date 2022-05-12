const YAML = require('yaml')
const fs = require('fs')

const { createWorkflowFromConfig } = require('./src/util/config-processor')
const {
  processAssignValuesRecursive,
  processInlineCodeRecursive,
  parseFunctionFromString
} = require('./src/util/inline-code')

function loadModule(name, callbacks) {
  const moduleLoader = require(`./src/module/${name}`)
  moduleLoader(callbacks)
}

const moduleCallbacks = {}

loadModule('noop', moduleCallbacks)
loadModule('console', moduleCallbacks)
loadModule('http', moduleCallbacks)

const FILE = 'test.yaml'
const workflowConfig = YAML.parse(fs.readFileSync(FILE, 'utf-8'))

const workflow = createWorkflowFromConfig(workflowConfig)
//console.log(JSON.stringify(workflow, null, 2))

executeWorkflow(workflow)
  .then(() => console.log('Done'))
  .catch(error => console.error(error))

async function executeWorkflow(workflow) {
  let stepName = workflow.stepIndex[0]
  const start = Date.now()
  while (stepName) {
    try {
      const step = workflow.stepDictionary[stepName]
      const nextStep = await executeStep(step, workflow.vars)
      stepName = nextStep || step.next || workflow.stepIndex[workflow.stepIndex.indexOf(stepName) + 1]
    } catch (err) {
      console.log(`*** ERROR: ${err.message}`)
      return
    }
  }
  const executionTimeInSeconds = (Date.now() - start) / 1000
  console.log(`*** Workflow execution finished. Total time elapsed: ${executionTimeInSeconds} seconds.`)
}

async function executeStep(step, vars) {
  console.log(`*** Running step "${step.__name}"`)
  const start = Date.now()
  let nextStep

  if (step.assign) {
    processAssignValuesRecursive(step.assign, vars)
  }
  else if (step.switch) {
    for (const switchCase of step.switch) {
      const conditionFn = parseFunctionFromString(switchCase.condition, vars)
      if (conditionFn()) {
        return switchCase.next
      }
    }
  }
  else if (step.call) {
    processInlineCodeRecursive(step, vars)
    nextStep = await moduleCallbacks[step.call](step, vars)
  }
  else {
    throw new Error(`Unknown step configuration`)
  }

  const executionTimeInMs = Date.now() - start
  console.log(`*** Step execution finished. Time elapsed: ${executionTimeInMs}ms.`)
  return nextStep
}
