//esto es de la documentacion de express

const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');
//esto cambio de su documentacion
//trasforma lo que sea que se esta subiendo 
//y lo coloca en un documento llamado files 
app.use(fileUpload({ useTempFiles: true }));

//put y post trabajan casi igual
app.put('/upload/:tipo/:id', function(req, res) {


    let tipo = req.params.tipo;
    let id = req.params.id;

    // si no hay archivos mandara un error 400
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)

        .json({
            ok: false,
            err: {
                message: 'No se encontro ningun archivo'
            }
        });
    }

    //validad tipo

    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'los tipos permitidos son : ' + tiposValidos.join(', ')

            }
        })

    }


    // archivo es el nombre que se va a posterar
    let archivo = req.files.archivo;

    // obtiene el nombre del archivo y divide por el .
    let nombreCortado = archivo.name.split('.');
    // a partir del areglo obtiene la ultima posisicion de
    // nombre completo
    let extension = nombreCortado[nombreCortado.length - 1];

    //extenciones permitidas

    let extencionesValidas = ['jpg', 'png', 'gif', 'jpeg', 'pdf'];

    if (extencionesValidas.indexOf(extension) < 0) {

        return res.status(400).json({
            ok: false,
            err: {
                message: 'las extenciones permitidas son: ' + extencionesValidas.join(', '),
                ext: extension
            }
        })
    }
    // Cambiar nombre al archivo

    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // en tipo al escoger en donde se guardara lo ara automatica mente
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        // aqui la imagen ya se cargo
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }


    });

});


function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({

                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        //let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${usuarioDB.img}`);
        //
        //if (fs.existsSync(pathImagen)) {
        //    //cuidado al implementar esta linea
        //    fs.unlinkSync(pathImagen);
        //
        //}

        borraArchivo(usuarioDB.img, 'usuarios');


        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });


    })
}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({

                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        //let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${usuarioDB.img}`);
        //
        //if (fs.existsSync(pathImagen)) {
        //    //cuidado al implementar esta linea
        //    fs.unlinkSync(pathImagen);
        //
        //}

        borraArchivo(productoDB.img, 'productos');


        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });


    })

}

function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    if (fs.existsSync(pathImagen)) {
        //cuidado al implementar esta linea
        fs.unlinkSync(pathImagen);

    }

}

module.exports = app;