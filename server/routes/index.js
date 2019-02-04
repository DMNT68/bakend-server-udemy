// Requires (importacion de librerias propias o de terceros que utilizamos para que funcione algo)
const express = require('express');


// incializar variables
const app = express();

app.use(require('./usuario'));
app.use(require('./login'));

module.exports = app;