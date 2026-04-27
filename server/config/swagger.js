import swaggerJsdoc from 'swagger-jsdoc';

const options = {
definition: {
    openapi: '3.0.0',
    info: {
      title: 'ServiceSphere API',
      version: '1.0.0',
      description: 'API documentation for the service booking platform',
    },
    // servers injected dynamically at request time in index.js
    security: [          // ← add this
      { bearerAuth: [] } // ← applies bearerAuth to all routes by default
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    // ... rest stays the same
    // Group tags in a logical order for the Swagger UI sidebar
    tags: [
      { name: 'Auth', description: 'Login, signup, logout for all user types' },
      { name: 'Services', description: 'Public service listings' },
      { name: 'Bookings', description: 'Booking management' },
      { name: 'Feedback', description: 'User feedback' },
      { name: 'Contact', description: 'Public contact form' },
      { name: 'Locations', description: 'Location management' },
      { name: 'Seeker', description: 'Seeker profile' },
      { name: 'Helper', description: 'Helper profile and dashboard' },
      { name: 'Moderator', description: 'Moderator panel' },
      { name: 'Admin', description: 'Admin panel' },
      { name: 'Administrator', description: 'Super admin / platform owner' },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;