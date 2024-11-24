require("dotenv").config();
const swaggerJSDoc = require('swagger-jsdoc');
const PORT = process.env.PORT || 3000;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Air Quality API',
            version: '1.0.0',
            description: 'API for retrieving air quality data',
            contact: {
                name: 'Developer',
                email: 'developer@example.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api`,
            },
        ],
    },
    apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = swaggerDocs;
