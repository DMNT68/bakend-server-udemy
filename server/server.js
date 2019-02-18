// Requires (importacion de librerias propias o de terceros que utilizamos para que funcione algo)
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// incializar variables
var app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Server index config OPCIONAL
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Ruta Global
app.use(require('./routes/index'));

// Conexión a la BDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', ' online');
});

// Escuchar
app.listen(3000, () => console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', ' online'));