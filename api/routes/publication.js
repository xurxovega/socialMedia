'use strict'

var express = require('express');
var PublicationController = require('../controllers/publication');
var mdAuth = require('../middlewares/auth');
var multiparty = require('connect-multiparty'); // Para subir ficheros
var mdUpload = multiparty({ uploadDir: './upload/img/publication' });

// Hay que añadir el use al fichero app.js para que enrute bien.
var api = express.Router();

api.get('/testGetPublication', PublicationController.testGetPublication);
api.post('/testPostPublication', PublicationController.testPostPublication);

api.post('/savepublication', mdAuth.ensureAuth, PublicationController.savePublication);

api.get('/publications/:page?', mdAuth.ensureAuth, PublicationController.getPublications);
api.get('/publication/:id', mdAuth.ensureAuth, PublicationController.getPublication);

api.delete('/publication/:id', mdAuth.ensureAuth, PublicationController.deletePublication);


module.exports = api;