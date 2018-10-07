'use strict'

var express = require('express');
var UserController = require('../controllers/user');
var mdAuth = require('../middlewares/auth');

var api = express.Router();

api.get('/testGet', UserController.testGet);
api.post('/testPost', UserController.testPost);
api.post('/signup', UserController.registerUser);
api.post('/login', UserController.loginUser);
api.get('/testGetAuth', mdAuth.ensureAuth, UserController.testGet);
api.get('/user/:id', mdAuth.ensureAuth, UserController.getUser );
api.get('/users/:page?', mdAuth.ensureAuth, UserController.getUsers);

api.put('/updateuser/:id', mdAuth.ensureAuth, UserController.updateUser);

module.exports = api;