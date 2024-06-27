const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();
const fs = require('fs');

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

    // Query SQL para insertar datos en la tabla Usuarios
    const sql = `INSERT INTO Usuarios (nombre, apellido, email, direccion, telefono, password) 
                 VALUES ('${nombre}', '${apellido}', '${email}', '${direccion}', '${telefono}', '${password}')`;

    // Ejecutar la consulta SQL
    conexion.query(sql, (err, result) => {
        if (err) {
            console.error("Error al guardar los datos en la base de datos:", err);
            return res.status(500).json({ success: false, message: 'Error al guardar los datos en la base de datos.' });
        }
        console.log("Datos insertados correctamente en la base de datos");
        // Enviar una respuesta JSON indicando éxito
        res.status(200).json({ success: true, message: 'Datos guardados correctamente.' });
    });
});

// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query SQL para verificar el usuario
    const sqlSelect = 'SELECT * FROM Usuarios WHERE email = ? AND password = ?';
    conexion.query(sqlSelect, [email, password], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).json({ success: false, message: 'Error al consultar la base de datos.' });
        }

        if (results.length > 0) {
            // Usuario encontrado, obtener el nombre de usuario
            const nombreUsuario = results[0].nombre;

            // Query SQL para insertar el nombre de usuario en la tabla logeado
            const sqlInsert = 'INSERT INTO logeado (nombre_usuario) VALUES (?)';
            conexion.query(sqlInsert, [nombreUsuario], (err, result) => {
                if (err) {
                    console.error('Error al insertar en la tabla logeado:', err);
                    return res.status(500).json({ success: false, message: 'Error al insertar en la tabla logeado.' });
                }

                console.log(`Usuario ${nombreUsuario} ha iniciado sesión`);

                // Enviar una respuesta JSON indicando éxito
                res.json({ success: true });
            });
        } else {
            // Usuario no encontrado
            res.json({ success: false, message: 'Correo o contraseña incorrectos.' });
        }
    });
});


// Ruta para confirmar la compra y guardar los productos en la base de datos
app.post('/confirmar-compra', (req, res) => {
    const productos = JSON.parse(req.body.productos);
    const idComprador = req.body.id_comprador; // Suponiendo que recibes el id_comprador desde el cliente

    // Query SQL para insertar productos comprados en la tabla Compras
    const sql = 'INSERT INTO Compras (nombre_producto, precio, comprador) VALUES ?';
    
    // Mapear productos para crear un array de arrays para la inserción SQL
    const values = productos.map(producto => [producto.nombre, producto.precio, idComprador]);

    // Ejecutar la consulta SQL
    conexion.query(sql, [values], (err, result) => {
        if (err) {
            console.error("Error al guardar los datos en la tabla Compras:", err);
            return res.status(500).json({ success: false, message: 'Error al confirmar la compra.' });
        }
        
        console.log("Productos comprados guardados en la tabla Compras");

        // Limpiar el carrito en localStorage después de confirmar la compra
        localStorage.removeItem('carrito');

        // Enviar una respuesta JSON indicando éxito
        res.status(200).json({ success: true, message: 'Compra confirmada exitosamente.' });
    });
});

// Ruta para guardar una compra en la base de datos
app.post('/guardar-compra', (req, res) => {
    const { nombre_producto, precio } = req.body;

    // Query SQL para obtener el último id_comprador registrado en la tabla logeado
    const sqlObtenerIdComprador = 'SELECT nombre_usuario FROM logeado ORDER BY id DESC LIMIT 1';
    
    // Ejecutar la consulta SQL para obtener el id_comprador
    conexion.query(sqlObtenerIdComprador, (err, rows) => {
        if (err) {
            console.error("Error al obtener el id_comprador:", err);
            return res.status(500).json({ success: false, message: 'Error al guardar compra en la base de datos.' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontró ningún usuario logueado.' });
        }

        const id_comprador = rows[0].id_comprador;

        // Query SQL para insertar datos en la tabla Compras
        const sqlInsertarCompra = `INSERT INTO Compras (nombre_producto, precio, comprador) VALUES (?, ?, ?)`;
        conexion.query(sqlInsertarCompra, [nombre_producto, precio, id_comprador], (err, result) => {
            if (err) {
                console.error("Error al guardar compra en la base de datos:", err);
                return res.status(500).json({ success: false, message: 'Error al guardar compra en la base de datos.' });
            }
            console.log("Compra registrada correctamente en la base de datos");
            // Enviar una respuesta JSON indicando éxito
            res.status(200).json({ success: true });
        });
    });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
