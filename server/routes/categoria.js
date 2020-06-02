const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');


//para que esto pueda funcionar y no sea solo un archivo de js
// se tiene que exportar a index.js

// ============================
// Mostrar todas las categorias
// ============================
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        //.sort sirve para ordenar y en este caso se ordena por la deripcion
        .sort('descripcion')
        //revisa que id hay en la categoria que estoy solicitando
        //y permite cargar informacion
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });

        })
});

////////////////////////////////////
/// motrar una categoria por id
////////////////////////////////////
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    //categoria.fineById
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    mesagge: 'El id no es correcto'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })

    })
});

////////////////////////////////////
/// Crear nueva categoria
////////////////////////////////////
app.post('/categoria', verificaToken, (req, res) => {
    //reguresa nueva categoria
    //req.usuario._id;
    //aqui biene la descripcion
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });


    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });


    });


});

////////////////////////////////////
/// Mostar todas las categorias
////////////////////////////////////
app.put('/categoria/:id', verificaToken, (req, res) => {
    //Es el mismo id mostrato arriba y abajo
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
            descripcion: body.descripcion
        }
        // el segundo parametro es el que se desea actualizar
    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

////////////////////////////////////
/// borrar id
////////////////////////////////////
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    // solo un admin puede borrar categorias
    //categoriaid.fineByIdAndRomove

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }

        res.json({
            ok: true,
            mesagge: 'Categoria Borrada'
        })
    })

});

module.exports = app;