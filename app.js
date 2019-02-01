// Requires (importacion de librerias propias o de terceros que utilizamos para que funcione algo)
const express = require('express');
const mongoose = require('mongoose');

// incializar variables
const app = express();

// Conexión a la BDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', ' online');
});


// Rutas
app.get('/', (req, res, next) => {

    res.status(403).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });

});

// Escuchar
app.listen(3000, () => console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', ' online'));