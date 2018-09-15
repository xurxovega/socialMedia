'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();

api.get('/testGet', UserController.testGet);
api.post('/testPost', UserController.testPost);

module.exports = api;