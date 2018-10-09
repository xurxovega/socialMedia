'use strict'

var express = require('express');
var FollowController = require('../controllers/follow');
var mdAuth = require('../middlewares/auth');

var api = express.Router();

// follow
api.get('/testFollow', FollowController.testGetFollow);
api.post('/follow/', mdAuth.ensureAuth ,FollowController.saveFollow);
api.delete('/unfollow/:id', mdAuth.ensureAuth, FollowController.deleteFollow);
api.get('/following/:id?/:page?', mdAuth.ensureAuth, FollowController.getFollowUsers);
api.get('/followers/:id?/:page?', mdAuth.ensureAuth, FollowController.getFollowedUsers);
api.get('/myfollows/:followed?', mdAuth.ensureAuth, FollowController.getMyFollows);

module.exports = api;