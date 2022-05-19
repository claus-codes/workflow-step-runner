const express = require('express')

const create = require('./create')
const read = require('./read')

const workflowRouter = express.Router()

workflowRouter.post('/', create)
workflowRouter.get('/:id', read)

module.exports = workflowRouter
