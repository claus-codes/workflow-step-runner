const YAML = require('yaml')
const fs = require('fs')

const { parseFunctionFromString } = require('./src/util/inline-code')
const { createWorkflowFromConfig } = require('./src/util/config-processor')

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
    await executeStep(step, workflow.vars)
    stepName = step.next || workflow.stepIndex[workflow.stepIndex.indexOf(stepName) + 1]
  }
  const executionTimeInSeconds = (Date.now() - start) / 1000
  console.log(`Workflow execution finished. Total time elapsed: ${executionTimeInSeconds} seconds.`)
}

async function executeStep(step, vars) {
  console.log(`Running step "${step.__name}"`)
  const start = Date.now()

  if (step.assign) {
    processAssignValuesRecursive(step.assign, vars)
  }
  if (step.switch) {

  }
  processInlineCodeRecursive(step, vars)

  console.log(`Vars after "${step.__name}"`, vars)

  const executionTimeInSeconds = (Date.now() - start) / 1000
  console.log(`Step execution finished. Time elapsed: ${executionTimeInSeconds} seconds.`)
}

function processAssignValuesRecursive(obj, vars) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' || typeof obj[key] === 'array') {
      processAssignValuesRecursive(obj[key], vars)
    }
    else if (typeof obj[key] === 'string') {
      const fn = parseFunctionFromString(obj[key], vars)
      if (fn) {
        vars[key] = fn()
      }
      else {
        vars[key] = obj[key]
      }
    }
    else {
      vars[key] = obj[key]
    }
  })
}

function processInlineCodeRecursive(obj, vars) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' || typeof obj[key] === 'array') {
      processInlineCodeRecursive(obj[key], vars)
    }
    else if (typeof obj[key] === 'string') {
      const fn = parseFunctionFromString(obj[key], vars)
      if (fn) {
        obj[key] = fn()
      }
    }
  })
}
