const express = require("express");
const swaggerUi = require("swagger-ui-express");
const apiDocs = require("./api-docs.json");
const cors = require("cors"); // Impor CORS

const app = express();
const PORT = 3000;

// Middleware untuk CORS
app.use(cors({
    origin: 'http://localhost:3000', // Ganti dengan URL front-end Anda
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Metode HTTP yang diizinkan
    allowedHeaders: ['Content-Type', 'Authorization'] // Header yang diizinkan
}));

// Middleware lainnya
app.use(express.json());

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiDocs));


// Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger Docs available on http://localhost:${PORT}/api-docs`);
});
