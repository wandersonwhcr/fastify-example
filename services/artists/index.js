const fastify = require('fastify')({
  logger: true,
});

fastify.register(require('fastify-mongodb'), {
  forceClose: true,
  url: process.env.MONGODB_URL,
});

fastify.get('/', {
  schema: {
    type: 'object',
    required: ['name', 'version'],
    parameters: {
      name: { type: 'string' },
      version: { type: 'string' },
    },
  },
  handler: async function (req, res) {
    res.status(200)
      .send({
        name: process.env.npm_package_name,
        version: process.env.npm_package_version,
      });
  },
});

// LISTAR ARTISTAS =================================================================================

fastify.get('/v1/artists', {
  schema: {
    type: 'array',
    items: {
      type: 'object',
      required: ['_id', 'name'],
      parameters: {
        _id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
      },
    },
  },
  handler: async function (req, res) {
    const result = await this.mongo.db.collection('artists').find().toArray();

    res.status(200)
      .send(result);
  },
});

fastify.listen(process.env.PORT, '0.0.0.0');
