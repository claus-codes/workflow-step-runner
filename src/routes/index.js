const express = require('express')

const workflowRouter = require('./workflow')

const rootRouter = express.Router()
rootRouter.use('/workflow', workflowRouter)

module.exports = rootRouter
