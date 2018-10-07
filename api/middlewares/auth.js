'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'SocialMedia2';

exports.ensureAuth = function (req, res, next) {
    if(!req.headers.authorization){
        return res.status(403).send({ message:'Petición sin cabecera de Autenticación (auth.js)'})
    }
    // Remplaza cualquier comilla simple ' o doble " del string por vacío ''
    var token = req.headers.authorization.replace(/['"]+/g, ''); 

    // Decodificar token
    try{
        var payload = jwt.decode(token, secretKey);
        if (payload.exp <= moment.unix()){
            // En este caso el toke tiene más de 1 día y ya no es válido.
            return res.status(401).send({ message: 'Token expirado (auth.js)'})
        }
    }catch(ex){
        return res.status(401).send({ message: 'Token no válido (auth.js)' })
    }

    // Se crea una variable user y además en esta variable tenemos todos los datos del usuario.
    req.user = payload; 

    next(); //Esto devuelve el control al siguiente método node del middleware
    

};