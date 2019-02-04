// Requires (importacion de librerias propias o de terceros que utilizamos para que funcione algo)
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// incializar variables
const app = express();
const Usuario = require('../models/usuario');
const SEED = require('../config/config').SEED;

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                err
            });
        }

        if (!usuarioDB) {

            return res.status(400).json({
                ok: false,
                mensaje: `Credenciales incorrectas - email`,
                error: { menssage: 'Email o crontraseña no válidos' }
            });

        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return res.status(400).json({
                ok: false,
                mensaje: `Credenciales incorrectas - password`,
                error: { menssage: 'Email o crontraseña no válidos' }
            });

        }

        // crear token
        usuarioDB.password = ';)';
        let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas

        res.status(200).json({
            ok: true,
            usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    })


});



module.exports = app;