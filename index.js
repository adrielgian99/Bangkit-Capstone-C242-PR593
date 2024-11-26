const express = require("express");
const swaggerUi = require("swagger-ui-express");
const apiDocs = require("./api-docs.json");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiDocs));

// Routes
app.use("/api/user", userRoutes);

// Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger Docs available on http://localhost:${PORT}/api-docs`);
});
