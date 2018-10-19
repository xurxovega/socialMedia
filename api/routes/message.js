'use strict'

var MessageController = require('../controllers/message');
var express = require('express');
var mdAuth = require('../middlewares/auth');

var api = express.Router();

api.get('/testGetMessage', MessageController.testGetMessage);
api.post('/testPostMessage', MessageController.testPostMessage);
api.post('/sendmessage', mdAuth.ensureAuth, MessageController.sendMessage);
api.get('/getmessage/:page?', mdAuth.ensureAuth, MessageController.getReceiverMessage);
api.get('/getemitermessage/:page?', mdAuth.ensureAuth, MessageController.getEmitMessage);
api.get('/getmessageunviewed', mdAuth.ensureAuth, MessageController.getMessageUnviewed);
api.post('/setmessageviewed/:id', mdAuth.ensureAuth, MessageController.setMessageViewed);


module.exports = api;