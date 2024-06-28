const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();

const conexion = mysql.createConnection({
    host: "localhost",
    database: "mercado",
    user: "root",
    password: ""
});

conexion.connect(function(err) {
    if (err) {
        throw err;
    }
    console.log("Conexión exitosa");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos desde el directorio 'zombiz-master'
app.use(express.static(path.join(__dirname, 'zombiz-master')));

// Ruta para servir Registro.html como la página de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'zombiz-master', 'Registro.html'));
});

app.post('/submit-form', (req, res) => {
    const { nombre, apellido, email, direccion, telefono, password } = req.body;

    const sql = `INSERT INTO Usuarios (nombre, apellido, email, direccion, telefono, password) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    conexion.query(sql, [nombre, apellido, email, direccion, telefono, password], (err, result) => {
        if (err) {
            console.error("Error al guardar los datos en la base de datos:", err);
            return res.status(500).json({ success: false, message: 'Error al guardar los datos en la base de datos.' });
        }
        console.log("Datos insertados correctamente en la base de datos");
        res.status(200).json({ success: true, message: 'Datos guardados correctamente.' });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sqlAuth = 'SELECT id FROM usuarios WHERE email = ? AND password = ?';
    conexion.query(sqlAuth, [email, password], (err, results) => {
        if (err) {
            console.error("Error al autenticar el usuario:", err);
            return res.status(500).json({ success: false, message: 'Error al autenticar el usuario.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
        }

        const idUsuario = results[0].id;

        const sqlCarrito = 'SELECT nombre_producto, precio FROM carrito WHERE comprador = ?';
        conexion.query(sqlCarrito, [idUsuario], (err, carritoResults) => {
            if (err) {
                console.error("Error al obtener el carrito del usuario:", err);
                return res.status(500).json({ success: false, message: 'Error al obtener el carrito.' });
            }

            const productosCarrito = carritoResults.map(row => ({
                nombre: row.nombre_producto,
                precio: row.precio
            }));

            if (productosCarrito.length > 0) {
                const sqlDeleteCarrito = 'DELETE FROM carrito WHERE comprador = ?';
                conexion.query(sqlDeleteCarrito, [idUsuario], (err, result) => {
                    if (err) {
                        console.error("Error al eliminar los datos del carrito:", err);
                        return res.status(500).json({ success: false, message: 'Error al limpiar el carrito.' });
                    }

                    console.log("Productos del carrito eliminados de la tabla carrito");

                    res.status(200).json({
                        success: true,
                        idUsuario: idUsuario,
                        carrito: productosCarrito
                    });
                });
            } else {
                res.status(200).json({
                    success: true,
                    idUsuario: idUsuario,
                    carrito: productosCarrito
                });
            }
        });
    });
});

app.post('/confirmar-compra', (req, res) => {
    const productos = req.body.productos;
    const idComprador = req.body.id_comprador;

    const sql = 'INSERT INTO Compras (nombre_producto, precio, comprador) VALUES ?';
    const values = productos.map(producto => [producto.nombre, producto.precio, idComprador]);

    conexion.query(sql, [values], (err, result) => {
        if (err) {
            console.error("Error al guardar los datos en la tabla Compras:", err);
            return res.status(500).json({ success: false, message: 'Error al confirmar la compra.' });
        }
        
        console.log("Productos comprados guardados en la tabla Compras");

        res.status(200).json({ success: true, message: 'Compra confirmada exitosamente.' });
    });
});

// conexion.js

// conexion.js

app.post('/guardar_carrito', (req, res) => {
    const productos = req.body.productos;
    const idComprador = req.body.id_comprador;

    console.log("ID del comprador recibido:", idComprador); // Verifica qué valor muestra aquí

    const sql = 'INSERT INTO carrito (nombre_producto, precio, comprador) VALUES ?';
    const values = productos.map(producto => [producto.nombre, producto.precio, idComprador]);

    conexion.query(sql, [values], (err, result) => {
        if (err) {
            console.error("Error al guardar los datos en la tabla carrito:", err);
            return res.status(500).json({ success: false, message: 'Error al guardar el carrito.' });
        }
        
        console.log("Productos del carrito guardados en la tabla carrito");

        res.status(200).json({ success: true, message: 'Carrito guardado exitosamente.' });
    });
});



  



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
