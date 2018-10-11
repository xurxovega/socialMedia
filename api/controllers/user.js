'use strict'

// Modelo de usuario
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var mongoosePagination = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');
var Follow = require('../models/follow');

function testGet (req, res) {
    res.status(200).send({ message: 'Testing Get on Node Js' });
}

function testPost (req, res) {
    console.log(req.body);
    res.status(200).send({ message: 'Testing Post on Node Js' });
}

// Registro de Nuevo Usuario
function registerUser (req, res) {
    
    var user = new User(); // Modelo de Usuario
    var params = req.body; // Parámetros de entrada de Usuario.

    if (params.name && params.surname && 
        params.nick && params.email && params.password){
        user.name    = params.name;
        user.surname = params.surname;
        user.nick    = params.nick;
        user.email   = params.email;
        user.role    = 'ROLE_USER';
        user.image   = null;

        // Controlar usuarios duplicados
        User.find({ 
            $or: [
                {email: user.email.toLowerCase()},
                {nick: user.nick.toLowerCase()}
            ]}).exec((err, users) => {
            if (err) return res.status(500).send({ message: 'Error al buscar usuario (user.registerUser)' });
            
            if(users && users.length >= 1){
                return res.status(200).send({ message: 'Usuario ya existe (user.registerUser)' });
            }else{
                // Cifra password y guarda datos
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error al guardar usuario (user.registerUser)' });
                        if (userStored) {
                            // console.log(userStored);
                            res.status(200).send({ user: userStored });
                        } else {
                            res.status(404).send({ message: 'Usuario no registrado (user.registerUser)' });
                        }
                    })
                });
            }
        });
    }else{
        res.status(200).send({message: 'Envia todos los datos necesarios'});
    }
}

// Login Usuario
function loginUser (req, res) {
    var params = req.body;

    var email    = params.email;
    var password = params.password;

    User.findOne({email: email}, (err, user)=>{
        if(err) return res.status(500).send({message: 'Error en logIn (user.loginUser)'});

        if (user){
            bcrypt.compare(password, user.password, (err, check) => {
                if(check){
                    if(params.gettoken){
                        return res.status(200).send({token: jwt.createToken(user)});
                    }else{
                        user.password = undefined; // Para no devolver este dato.
                        return res.status(200).send({ user: user });
                    }
                }else{
                    return res.status(404).send({ message: 'Usuario o contraseña incorrecta (user.loginUser)' }); 
                }
            });
        }else{
            return res.status(404).send({ message: 'Usuario o contraseña incorrecta (user.loginUser)' }); 
        }

    });

}

// Consulta Usuario
function getUser (req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({message: 'Error en la petición user.getUser'});

        if(!user) return res.status(404).send({message: 'Usuario no existe'});

        user.password = undefined; // Para no devolver el password en el objecto;
        // Al utilizar sync devuelve una promesa
        getfollowThisUser(req.user.id, userId).then( (valueFollow)=> {
            return res.status(200).send(
                {    user,
                    following: valueFollow.following,
                    followed: valueFollow.followed
              });
        });
        console.log('trace4');

    });
}

async function getfollowThisUser(identUserId, userId){
    // Con el await esperemos sincronamente a que acabe la llamada
    var following = 
        await Follow
            .findOne({ user: identUserId, followed: userId } //)
                , (err, follow) => {
            // .exec((err, follow) => { // el Exec no mapea bien el resultado
                if (err) return handleError(err);
                return  follow;
            });

    var followed =  
        await Follow
            .findOne({ user: userId , followed: identUserId } //)
            //.exec((err, follow) => { // el Exec no mapea bien el resultado
                , (err, follow) => {
                if (err) return handleError(err);
                return follow;
            });

        return {
            following: following,
            followed: followed
        }
}

// Consulta Usuario Paginado
function getUsers (req, res) {
    var identityUserId = req.user.id;
    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }
    var itemsPerPage = 2;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {

        if (err) return res.status(500).send({message: 'Error en la petición user.getUsers'});

        if(!users)  return res.status(404).send({message: 'No existen usuarios'});

        getFollowsUsersId(identityUserId).then((valueFollow) => {
            return res.status(200).send({
                users,
                userFollowing: valueFollow.following,
                userFollowedMe: valueFollow.followed,
                total,
                pages: Math.ceil(total / itemsPerPage)
            });
        });

    });
}


async function getFollowsUsersId(userId){

    var following = 
        await Follow.find({user: userId},  { '_id': 0, '__v': 0, 'user': 0 }, //'followed',
            (err, follows) => {
            if (err) return handleError(err);
        
            var followingArray = [];
            follows.forEach((follow) => {
                followingArray.push(follow.followed);
            });
            return followingArray;
        });

    var followed =
        await Follow.find({ followed: userId }, { '_id': 0, '__v': 0, 'followed': 0 }, //'user',
            (err, follows) => {
                if (err) return handleError(err);

                var followingArray = [];
                follows.forEach((follow) => {
                    followingArray.push(follow.followed);
                });
                return followingArray;
            }); 
    return {
        following: following,
        followed: followed
    }
}

// Actualizar Usuario
function updateUser (req, res) {
    var userId = req.params.id;
    var updateParams = req.body;

    delete updateParams.password; // Borra la propiedad password del objeto.

    if(userId != req.user.id){ //Comprueba que el usuario logado es el mismo que el que modificamos
        return res.status(500).send({message: 'No tienes permiso para modificar el usuario user.updateUser'});

    }

    User.findOneAndUpdate(userId, updateParams, {new: true}, (err, userUpdated) => {
        if(err) return res.status(500).send({message: 'Error al actualizar usuario user.userUpdate'});
        if (!userUpdated) return res.status(404).send({ message: 'No se ha actualizado el usuario user.userUpdate' });
        
        return res.status(200).send({user: userUpdated});

    });
}

// Actualizar Imagen Usuario
function updloadImage (req, res) {
    var userId = req.params.id;

    if (req.files) {
        //console.log(req.files);
        //var filePath = req.files.image.path;
        //var fileSplit = filePath.split('\\');
        //var fileName = fileSplit[2];
        var filePath = req.files.image.path;
        var fileName = req.files.image.path.split('\\')[3];
        var fileExt  = fileName.split('\.')[1];

        if (userId != req.user.id) {
             return removeFiles(res, filePath, 'No tienes permiso para modificar el usuario user.uploadimage');
             // hay que poner return ya que no es asincrónico y si se le da rápido y seguido se peta
        }

        if(fileExt == 'png'|| fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
            // Actualizar documento de usuario logueado
            User.findOneAndUpdate( 
                userId, 
                {image: fileName}, 
                { new: true }, 
                (err, userUpdated) => {
                    if (err) return res.status(500).send({ message: 'Error al actualizar usuario user.userUpdate' });
                    if (!userUpdated) return res.status(404).send({ message: 'No se ha actualizado el usuario user.userUpdate' });

                    return res.status(200).send({ user: userUpdated });
                }
            );
        }else{
            return removeFiles(res, filePath, 'Extensión de fichero no válida');
            // hay que poner return ya que no es asincrónico y si se le da rápido y seguido se peta
        }
    }else{
        res.status(200).send({message:'No se han enviado mensajes'});
    }

}

// Obtener imagen
function getImageFile(req, res){
    var imgFile = req.params.imageFile;

    var pathFile = './upload/img/users/' + imgFile;

    fs.exists(pathFile, (exist) => {
        if(exist){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(200).send({message: 'No existe la imagen'});
        }
    });
}

// Borra ficheros
function removeFiles(res, filePath, message){ // se pasa el res para poder devolver la respuesta
    fs.unlink(filePath, (err) => {
        return res.status(200).send({ message: message });
    });
}



module.exports = {
  testGet,
  testPost,
  registerUser,
  loginUser,
  getUser,
  getUsers,
  updateUser,
  updloadImage,
  getImageFile
};
