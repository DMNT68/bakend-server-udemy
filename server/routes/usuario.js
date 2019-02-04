// Requires (importacion de librerias propias o de terceros que utilizamos para que funcione algo)
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mdAutenticacion = require('../middleware/autenticacion');

// incializar variables
const app = express();
const Usuario = require('../models/usuario');


/**
 * OBTENER TODOS LOS USUARIOS
 **/
app.get('/usuario', mdAutenticacion.verificaToken, (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec((err, usuariosDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuarios',
                    err
                });
            }

            res.status(200).json({
                ok: true,
                usuariosDB
            });

        });

});


/** 
 * CREAR USUARIO 
 **/
app.post('/usuario', mdAutenticacion.verificaToken, (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
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
app.put('/usuario/:id', mdAutenticacion.verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

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
app.delete('/usuario/:id', mdAutenticacion.verificaToken, (req, res) => {

    let id = req.params.id;
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