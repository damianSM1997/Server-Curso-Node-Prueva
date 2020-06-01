require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
//no se isntala porque es un paquete que tiene node por defecto
const path = require('path');

const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// habilitar carpeta public

//asi no sale app.use(express.static(__dirname + '../public'))
//se tiene que exportar el path
app.use(express.static(path.resolve(__dirname, '../public')));

// asi sale bien la direccion
//console.log(path.resolve(__dirname, '../public'));

// Configuración global de rutas
//cambios xd ignorar
app.use(require('./routes/index'));



mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    //useFindAndModify: false
}, (err, res) => {

    if (err) throw err;

    console.log('Base de datos ONLINE');

});



app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
});