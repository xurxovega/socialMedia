'use strict'

var jwt = require ('jwt-simple');
var moment = require('moment');
var secretKey = 'SocialMedia2';

exports.createToken = function(user){
    var payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(1, 'days').unix()
    };

    return jwt.encode(payload, secretKey); // El token se basa en todos los datos del usuario

};