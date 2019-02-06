// Requires (importacion de librerias propias o de terceros que utilizamos para que funcione algo)
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const { verificaToken } = require('../middleware/autenticacion');

// incializar variables
var app = express();
var Usuario = require('../models/usuario');


/**
 * OBTENER TODOS LOS USUARIOS
 **/
app.get('/usuario', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, usuariosDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuarios',
                    err
                });
            }

            Usuario.countDocuments((err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuarios',
                        err
                    });
                }
                res.status(200).json({
                    ok: true,
                    usuariosDB,
                    total: conteo

                });
            });



        });

});


/** 
 * CREAR USUARIO 
 **/
app.post('/usuario', verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    })

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios',
                err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});



/**
 * ACTUALIZAR USUARIO 
 **/
app.put('/usuario/:id', verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar usuario',
                err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id: ${id} no existe`,
                error: { message: 'No existe un usuario con ese id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    err
                });
            }

            usuarioGuardado.password = ';)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });
    });

});


/** 
 * BORRAR UN USUARIO 
 **/
app.delete('/usuario/:id', verificaToken, (req, res) => {

    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id: ${id} no existe`,
                error: { message: 'El usuario no existe con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuarioBorrado
        });

    });

});

module.exports = app;