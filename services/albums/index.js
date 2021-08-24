const fastify = require('fastify')({
  logger: true,
});

fastify.listen(process.env.PORT, '0.0.0.0');
