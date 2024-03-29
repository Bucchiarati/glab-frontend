const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const createTables = async () => {

  const usersQuery = `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    rol VARCHAR(255) NOT NULL,
    email_verified_at TIMESTAMP,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`;

  const rolesQuery = `CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`;

  const reservacionesQuery = `
    CREATE TABLE IF NOT EXISTS reservaciones (
      id SERIAL PRIMARY KEY,
      nombres VARCHAR(255) NOT NULL,
      apellidos VARCHAR(255) NOT NULL,
      tipodocumento VARCHAR(255) NOT NULL,
      identificacion VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      fechareserva TIMESTAMP NOT NULL,
      tiporeserva VARCHAR(255) NOT NULL,
      cantidadpersonas INTEGER NOT NULL,
      descripcion TEXT,
      estado VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try{
    await pool.query(usersQuery);
    await pool.query(rolesQuery);
    await pool.query(reservacionesQuery);
    console.log('Tablas creadas correctamente');
  } catch (error) {
    console.error('Error al crear las tablas:', error);
  }
};

  const createUser = async () => {
    const checkUserQuery = `
    SELECT id FROM users WHERE email = 'admin@mail.com' LIMIT 1;
    `;
    const checkUserResult = await pool.query(checkUserQuery);

    if (checkUserResult.rows.length > 0) {
      console.log('El usuario admin ya existe');
      return;
    }

    const user = {
      name: 'Admin',
      email: 'admin@mail.com',
      rol: 'admin',
      email_verified_at: new Date().toISOString(),
      password: bcrypt.hashSync('admin', 10),
      remember_token: 'admin'
    };

    const query = `
    INSERT INTO users (name, email, rol, email_verified_at, password, remember_token)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;

  const values = [user.name, user.email, user.rol, user.email_verified_at, user.password, user.remember_token];

  try {
    await pool.query(query, values);
    console.log('Usuario creado correctamente');
  }
  catch (error) {
    console.error('Error al crear el usuario:', error);
  }
  };
  const assignAdminRole = async () => {
    const checkRoleQuery = `
      SELECT id
      FROM roles
      WHERE user_id = (
        SELECT id
        FROM users
        WHERE email = 'admin@mail.com'
        LIMIT 1
      )
      LIMIT 1
    `;
    const checkRoleResult = await pool.query(checkRoleQuery);
  
    if (checkRoleResult.rows.length > 0) {
      console.log('El rol de admin ya ha sido asignado al usuario administrador');
      return;
    }
  
    const query = `
      INSERT INTO roles (name, user_id)
      SELECT $1, users.id FROM users WHERE users.email = $2;
    `;
    const values = ['admin', 'admin@mail.com'];
  
    try {
      await pool.query(query, values);
      console.log('Rol de admin asignado correctamente');
    } catch (error) {
      console.error('Error al asignar el rol de admin:', error);
    }
  };

const initializeDatabase = async () => {
  await createTables();
  await createUser();
  await assignAdminRole();
};


const app = express();
const port = 3000;

// Configura el middleware para analizar las solicitudes JSON
app.use(bodyParser.json());

// Configura el middleware para permitir solicitudes de origen cruzado
app.use(cors());

// Configuracion de la conexión a la base de datos PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db_glab',
  password: 'admin',
  port: 5432,
});

initializeDatabase();

// Ruta para el inicio de sesión
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica si el correo electrónico existe en la base de datos
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Correo electrónico no existe'});
    }

    // Compara la contraseña ingresada con la contraseña almacenada en la base de datos
    const user = result.rows[0];
    
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Contraseña incorrecta'});
    }

    // Verifica si el ID del usuario está en la tabla de roles
    const query2 = 'SELECT * FROM roles WHERE user_id = $1';
    const result2 = await pool.query(query2, [user.id]);

    if (result2.rows.length === 0) {
      return res.status(401).json({ message: 'El usuario no tiene el rol de administrador'});
    }

    // Crea un token JWT
    const payload = { user: { id: user.id, name: user.name, email: user.email, rol: user.rol } };
    const key = 'secret';
    const token = jwt.sign(payload, key, { expiresIn: '1h' });

    // Devuelve el token en la respuesta
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ message: 'Error al iniciar sesión', errorCode: 500, error });
  }
});

// Ruta para guardar los datos de la reservación
app.post('/api/reservaciones', async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      tipodocumento,
      identificacion,
      email,
      fechareserva,
      tiporeserva,
      cantidadpersonas,
      observaciones,
      estado
    } = req.body;

    // Realiza la inserción en la base de datos
    const query = `
      INSERT INTO reservaciones (nombres, apellidos, tipodocumento, identificacion, email, fechareserva, tiporeserva, cantidadpersonas, descripcion, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      nombres,
      apellidos,
      tipodocumento,
      identificacion,
      email,
      fechareserva,
      tiporeserva,
      cantidadpersonas,
      observaciones,
      estado
    ];
    const result = await pool.query(query, values);

    // Devuelve los datos de la reservación guardada
    const reservacion = result.rows[0];
    return res.status(200).json({ reservacion });
  } catch (error) {
    console.error('Error al guardar la reservación:', error);
    return res.status(500).json({ message: 'Error al guardar la reservación', error });
  }
});

// Ruta para obtener los datos de las reservaciones
app.get('/api/reservaciones', async (req, res) => {
  try {
    // Obtiene todas las reservaciones de la base de datos
    const query = 'SELECT * FROM reservaciones';
    const result = await pool.query(query);

    // Devuelve las reservaciones
    const reservaciones = result.rows;
    return res.status(200).json({ reservaciones });
  } catch (error) {
    console.error('Error al obtener las reservaciones:', error);
    return res.status(500).json({ message: 'Error al obtener las reservaciones', error });
  }
});

app.put('/api/reservaciones/:id', async (req, res) => {
  try {
    const reservationId = req.params.id;
    const {
      nombres,
      apellidos,
      tipodocumento,
      identificacion,
      email,
      fechareserva,
      tiporeserva,
      cantidadpersonas,
      observaciones,
      estado
    } = req.body;

    // Actualizar la reserva en la base de datos
    const query = `
      UPDATE reservaciones
      SET nombres = $1, apellidos = $2, tipodocumento = $3, identificacion = $4, email = $5, fechareserva = $6, tiporeserva = $7, cantidadpersonas = $8, descripcion = $9, estado = $10
      WHERE id = $11
    `;
    const values = [
      nombres,
      apellidos,
      tipodocumento,
      identificacion,
      email,
      fechareserva,
      tiporeserva,
      cantidadpersonas,
      observaciones,
      estado,
      reservationId
    ];
    await pool.query(query, values);

    return res.status(200).json({ message: 'Reserva actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar la reserva:', error);
    return res.status(500).json({ message: 'Error al actualizar la reserva', error });
  }
});

// Inicia el servidor Express
app.listen(port, () => {
  console.log(`Servidor backend iniciado en http://localhost:${port}`);
});
