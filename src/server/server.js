const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes');
const app = express();
const cors = require("cors");

const PORT = 8080;

// Middleware untuk membaca body request
app.use(bodyParser.json());

// Middleware untuk CORS
app.use(cors({
    origin: 'http://localhost:8080', // Ganti dengan URL front-end
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Metode HTTP yang diizinkan
    allowedHeaders: ['Content-Type', 'Authorization'] // Header yang diizinkan
}));

// Middleware
app.use(express.json());

app.use('/', router);
app.use('/api', router);
app.use('/prediksi', router);

// Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
