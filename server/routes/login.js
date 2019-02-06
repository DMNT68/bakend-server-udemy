// Requires (importacion de librerias propias o de terceros que utilizamos para que funcione algo)
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');



// incializar variables
var app = express();
var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/** 
 * AUTENTICACIÓN GOOGLE
 **/
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                err
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal',
                });
            } else {

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas

                res.status(200).json({
                    ok: true,
                    usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });

            }
        } else {
            // El usuario no existe... hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuario',
                        err
                    });
                }
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas

                res.status(200).json({
                    ok: true,
                    usuarioDB,
                    token: token
                });
            }));
        }
    });

});







/** 
 * AUTENTICACIÓN NORMAL 
 **/
app.post('/login', (req, res) => {

    var body = req.body;

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
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas

        res.status(200).json({
            ok: true,
            usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    })


});



module.exports = app;