const fs = require('fs')
const path = require('path')

const { createWorkflow } = require("../../database/workflow")
const { runWorkflow } = require("../../workflow")

function createWorkflowHandler(request, response) {
  console.log(request.body)
  const { body: { config, template } } = request
  if (!config && !template) {
    response.status(400).json({ error: 'Bad request' })
    return
  }
  let loadedConfig = config
  if (template) {
    // FIXME: gaping security hole...
    loadedConfig = fs.readFileSync(path.resolve(`template/${template}.yaml`), 'utf-8')
  }
  const workflow = createWorkflow(loadedConfig)
  response.status(200).json({ workflow })

  runWorkflow(workflow.id)
}

module.exports = createWorkflowHandler
