'use strict'

var Publication = require ('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');



function testGetPublication(req, res) {
    return res.status(200).send({message: 'Test Get Publication'});
}

function testPostPublication(req, res) {
    var params = req.body;
    var messageText = params.message + ' -> Creado a las ' + moment().unix();
    return res.status(200).send({ message: messageText });
}


// Guardar publicación
function savePublication(req, res){

    var userId = req.user.id;
    var params = req.body;

    var publication = new Publication();

    if(!params.text) return res.status(200).send({message: 'Parametros incorrectos'});

    publication.text = params.text;
    publication.file = null;
    publication.user = userId;
    publication.created_at = moment().unix();

    publication.save((err, pubStored) => {
        if (err) return res.status(500).send({message: 'Error al guardar la publicación'});
        if (!pubStored) return res.status(404).send({ message: 'Publicación errónea' });

        return  res.status(200).send({message: 'Publicación guardada con éxito', 
                                      publication: pubStored});
    });

}


// Listar publicacion de usuaruios que yo sigo
function getPublications(req, res){

    var userId = req.user.id;
    var page = 1;
    var itemsPerPage = 2;
    

    if (req.params.page) {
        page = req.params.page;
    }

    Follow.find({ user: userId }, (err, follows) => {

        var userFollowing = [];
        follows.forEach(follow => {
            userFollowing.push(follow.followed);
        });

        // Buscamos publicaciones de usuarios seguidos.
        Publication
            .find({ user: { '$in': userFollowing } }) // con el comando in buscamos los que contenga dicho valor
            .sort('-created_at') // con el menos se ordena a la inversa
            .populate('user') // mapea al model creado
            .paginate(page, itemsPerPage, (err, publications, total) => {
                if (err) return res.status(500).send({ message: 'Error al buscar publicaciones' });
                if (!publications) return res.status(404).send({ message: 'No hay publicaciones' });

                return res.status(200).send({
                    total,
                    pages: Math.ceil(total / itemsPerPage),
                    page: page,
                    publications
                });
            });
    });

}


// Mostra una publicación
function getPublication(req, res){

    var publicationId = req.params.id;

    Publication.findOne({'_id': publicationId}, (err, publication) => {
        if (err) return res.status(500).send({ message: 'Error al buscar publicación' });
        if (!publication) return res.status(404).send({ message: 'No exite publicación' });
        return res.status(200).send({publication});
    });
}

//Borrar publicacion.
function deletePublication(req, res){
    
    var publicationId = req.params.id;
    var userId = req.user.id;

    Publication.deleteOne({ user: userId, _id: publicationId }, (err) => {
        if (err) return res.status(500).send({ message: 'Error al buscar publicación' });
        return res.status(200).send({ message: 'Publicación borrada' });
    });
    /*
    Publication
        .find({user: userId, _id: publicationId}) // Con comas funciona como un AnD
        .remove( (err) => {
            if (err) return res.status(500).send({ message: 'Error al buscar publicación' });
            return res.status(200).send({ message: 'Publicación borrada' });
        });
    */

    /*
    Publication.findOneAndRemove({ '_id': publicationId }, (err, publicationRemove) => {
        if (err) return res.status(500).send({ message: 'Error al buscar publicación' });
        if (!publicationRemove) return res.status(404).send({ message: 'No exite publicación' });
        return res.status(200).send({ message: 'Publicación borrada' });
    });
    */
}


// Subir imagen a publicación
function uploadImage(req, res){
    var userId = req.user.id;
    var publicationId = req.params.id;

    if (req.files) {

        var filePath = req.files.image.path;
        var fileName = req.files.image.path.split('\\')[3];
        var fileExt  = fileName.split('\.')[1];


        if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {
            // Actualizar documento de publicacion
            Publication.findOneAndUpdate(
                {user: userId, _id: publicationId},
                { file: fileName },
                { new: true },
                (err, publicationUpdated) => {
                    if (err) {
                        return removeFiles(res, filePath, 'Error al actualizarla publicación');
                    }
                    if (!publicationUpdated) {
                        return removeFiles(res, filePath, 'No se ha actualizado la publicación' );
                    }
                    return res.status(200).send({ user: publicationUpdated });
                }
            );
        } else {
            return removeFiles(res, filePath, 'Extensión de fichero no válida');
            // hay que poner return ya que no es asincrónico y si se le da rápido y seguido se peta
        }
    } else {
        res.status(200).send({ message: 'No se han enviado mensajes' });
    }

}


// Obtener imagen
function getImageFile(req, res) {
    var imgFile = req.params.imageFile;

    var pathFile = './upload/img/publications/' + imgFile;

    fs.exists(pathFile, (exist) => {
        if (exist) {
            res.sendFile(path.resolve(pathFile));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    });
}


// Borra ficheros
function removeFiles(res, filePath, message) { // se pasa el res para poder devolver la respuesta
    fs.unlink(filePath, (err) => {
        return res.status(200).send({ message: message });
    });
}



module.exports = {
  testGetPublication,
  testPostPublication,
  savePublication,
  getPublications,
  getPublication,
  deletePublication,
  uploadImage,
  getImageFile
};