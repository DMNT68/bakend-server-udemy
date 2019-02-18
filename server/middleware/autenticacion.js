const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

/** 
 * VERFICAR TOKEN 
 **/
let verificaToken = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                err
            });
        }

        req.usuario = decoded.usuario;
        next();

    });
};

/** 
 * VERFICAR ADMIN 
 **/
let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            erros: { message: 'No es administrador, no puede hacer eso' }
        });
    }

};


/** 
 * VERFICAR ADMIN O MISMO USUARIO
 **/
let verificaAdminRole_o_MismoUsuario = (req, res, next) => {

    let usuario = req.usuario;
    let id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            erros: { message: 'No es administrador, no puede hacer eso' }
        });
    }

};

module.exports = { verificaToken, verificaAdminRole, verificaAdminRole_o_MismoUsuario };