// Requires (importacion de librerias propias o de terceros que utilizamos para que funcione algo)
var express = require('express');

var { verificaToken } = require('../middleware/autenticacion');

// incializar variables
var app = express();

//Modelo
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');

/** 
 * OBTENER TODOS LOS MÉDICOS 
 **/
app.get('/medico', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre img usuario medico')
        .populate('hospital', 'nombre')
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec((err, medicoBD) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar médico',
                    err
                });
            }

            Medico.countDocuments((err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar medico',
                        err
                    });
                }

                res.status(200).json({
                    ok: true,
                    medicoBD,
                    total: conteo
                });
            });



        });
});


/** 
 * CREAR MÉDICO 
 **/
app.post('/medico', verificaToken, (req, res) => {

    var body = req.body;
    var idHospital = body.hospital;

    Hospital.findById(idHospital, (err, hospitalBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear médico',
                err
            });
        }

        if (!hospitalBD) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id: ${idHospital} no existe`,
                error: { message: 'No existe un médico con ese id' }
            });
        }

        var medico = new Medico({
            nombre: body.nombre,
            usuario: req.usuario._id,
            hospital: body.hospital
        });

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear médico',
                    err
                });
            }

            res.status(201).json({
                ok: true,
                medicoGuardado
            });
        });

    });

});


/** 
 * ACTUALIZAR MÉDICO
 **/
app.put('/medico/:id', verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    var idHospital = body.hospital;

    Hospital.findById(idHospital, (err, hospitalBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear médico',
                err
            });
        }

        if (!hospitalBD) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id: ${idHospital} no existe`,
                error: { message: 'No existe un médico con ese id' }
            });
        }

        var actualizar = {
            nombre: body.nombre,
            usuario: req.usuario._id,
            hospital: body.hospital
        }

        Medico.findByIdAndUpdate(id, actualizar, { new: true }, (err, medicoBD) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar médico',
                    err
                });
            }

            if (!medicoBD) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El médico con el id: ${id} no existe`,
                    error: { message: 'No existe un médico con ese id' }
                });
            }

            res.json({
                ok: true,
                medicoBD
            });
        });

    });

});


/** 
 * BORRAR MÉDICO
 **/
app.delete('/medico/:id', verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar médico',
                err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El médico con el id: ${id} no existe`,
                error: { message: 'No existe un médico con ese id' }
            });
        }

        res.json({
            ok: true,
            medicoBorrado
        });

    });
});

module.exports = app;