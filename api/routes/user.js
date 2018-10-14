'use strict'

var express = require('express');
var UserController = require('../controllers/user');
var mdAuth = require('../middlewares/auth');
var multiparty = require('connect-multiparty'); // Para subir ficheros
// Hay que añadir el use al fichero app.js para que enrute bien.

var api = express.Router();
var mdUpload = multiparty({uploadDir:'./upload/img/users'})

// Users
// api.get('/testGet', UserController.testGet);
// api.post('/testPost', UserController.testPost);
api.post('/signup', UserController.registerUser);
api.post('/login', UserController.loginUser);
// api.get('/testGetAuth', mdAuth.ensureAuth, UserController.testGet);

api.get('/user/:id', mdAuth.ensureAuth, UserController.getUser );
api.get('/users/:page?', mdAuth.ensureAuth, UserController.getUsers);
api.get('/counters/:id?', mdAuth.ensureAuth, UserController.getCounters);

api.put('/updateuser/:id', mdAuth.ensureAuth, UserController.updateUser);

api.post('/uploadimguser/:id', [mdAuth.ensureAuth, mdUpload], UserController.updloadImage);

api.get('/getimguser/:imageFile', mdAuth.ensureAuth, UserController.getImageFile);


module.exports = api;