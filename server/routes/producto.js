const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion')

let app = express();
let Producto = require('../models/producto');

//////////////////////////////////
//obtener todos lso productos
//////////////////////////////////

app.get('/productos', verificaToken, (req, res) => {
    // trae todos lso productos
    // populate: usuaro categoria
    //paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);
    // entre parentesis va la parte de disponible que te nteresa
    //puede cambiar de acuerdo a tumodelo

    //, 'nombre precioUni'
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.count({ estado: true }, (err, conteo) => {

                res.json({
                    ok: true,
                    producto,
                    cuantos: conteo
                });

            });


        });
});

//////////////////////////////////
//obtener producto por id
//////////////////////////////////

app.get('/productos/:id', verificaToken, (req, res) => {
    // trae todos lso productos
    // populate: usuaro categoria
    //paginado

    let id = req.params.id;



    // el segundo parametro es el que se desea actualizar
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }


            res.json({
                ok: true,
                producto: productoDB
            });
        })
});
//////////////////////////////////
//Nuscar productos
//////////////////////////////////
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    // con expreciones regulares se pueden hacer busquedas mucho ams flexibles
    let regex = new RegExp(termino, 'i')

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })

        })
})


//////////////////////////////////
//Crear un nuevo producto
//////////////////////////////////

app.post('/productos', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado de categoria
    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.json(400).json({
                ok: false,
                err
            });
        }


        res.status(201).json({
            ok: true,
            producto: productoDB
        });


    });
});




//////////////////////////////////
//Actualizar un producto
//////////////////////////////////

app.put('/productos/:id', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado 

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });

        });

    });


});


//////////////////////////////////
//Borrar un producto
//////////////////////////////////

app.delete('/productos/:id', verificaToken, (req, res) => {
    // trae todos lso productos
    // populate: usuaro categoria
    // disponible ------> falso

    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productoBorrado,
                message: 'producto borrado'
            })

        });


    });
});

module.exports = app;