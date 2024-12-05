const express = require('express');
const bodyParser = require('body-parser');
const apiDocs = require("../../api-docs.json");
const swaggerUi = require("swagger-ui-express");
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

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiDocs));

// Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger Docs available on http://localhost:${PORT}/api-docs`);
});
