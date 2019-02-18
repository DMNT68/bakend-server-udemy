// Requires (importacion de librerias propias o de terceros que utilizamos para que funcione algo)
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var { verificaToken } = require('../middleware/autenticacion');

// incializar variables
var app = express();
var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');

/** 
 * OBTENER TODOS LOS HOSPITALES 
 **/
app.get('/hospital', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, 'nombre img usuario')
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec((err, hospitalBD) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    err
                });
            }

            Hospital.countDocuments((err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar medico',
                        err
                    });
                }
                res.status(200).json({
                    ok: true,
                    hospitales: hospitalBD,
                    total: conteo
                });

            });


        });
});

/**
 * OBTENER UN HOPITAL POR ID 
 **/
app.get('/hospital/:id', (req, res) => {

    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe ',
                    errors: {
                        message: 'No existe un hospital con ese ID '
                    }
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });

});


/** 
 * CREAR HOSPITAL 
 **/
app.post('/hospital', verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                err
            });
        }

        res.status(201).json({
            ok: true,
            hospitalGuardado
        });
    });

});


/** 
 * ACTUALIZAR HOSPITAL
 **/
app.put('/hospital/:id', verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    var actualizar = {
        nombre: body.nombre,
        usuario: req.usuario._id
    }

    Hospital.findByIdAndUpdate(id, actualizar, { new: true }, (err, hospitalBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar hopital',
                err
            });
        }

        if (!hospitalBD) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id: ${id} no existe`,
                error: { message: 'No existe un hopital con ese id' }
            });
        }

        res.json({
            ok: true,
            hospital: hospitalBD
        });
    });

});


/** 
 * BORRAR HOSPITAL
 **/
app.delete('/hospital/:id', verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hopital',
                err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id: ${id} no existe`,
                error: { message: 'No existe un hopital con ese id' }
            });
        }

        res.json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});

module.exports = app;