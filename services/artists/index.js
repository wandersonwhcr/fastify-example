const { Binary } = require('mongodb');
const uuid = require('uuid');

class UUID extends Binary {
  constructor(buffer) {
    super(buffer, Binary.SUBTYPE_UUID);
  }
  static fromBinary(content) {
    return new UUID(content.buffer);
  }
  static fromString(content) {
    return new UUID(uuid.parse(content));
  }
  toString() {
    return uuid.stringify(this.buffer);
  }
}

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
    properties: {
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
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          required: ['_id', 'name'],
          properties: {
            _id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
          },
        },
      },
    },
  },
  handler: async function (req, res) {
    const result = await this.mongo.db.collection('artists').find().toArray();

    result.forEach((element) => {
      element._id = UUID.fromBinary(element._id);
    });

    res.status(200)
      .send(result);
  },
});

// ADICIONAR ARTISTA ===============================================================================

fastify.post('/v1/artists', {
  schema: {
    body: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
      },
    },
    response: {
      201: {
        type: 'object',
        required: ['_id'],
        properties: {
          _id: { type: 'string' },
        },
      },
    },
  },
  handler: async function (req, res) {
    const _id = UUID.fromString(uuid.v4());

    await this.mongo.db.collection('artists')
      .insertOne({ _id, ...req.body });

    res.status(201)
      .send({ _id });
  },
});

// APRESENTAR ARTISTA ==============================================================================

fastify.get('/v1/artists/:_id', {
  schema: {
    params: {
      _id: { type: 'string', format: 'uuid' },
    },
    response: {
      200: {
        type: 'object',
        required: ['_id', 'name'],
        properties: {
          _id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
        },
      },
    },
  },
  handler: async function (req, res) {
    const _id = UUID.fromString(req.params._id);

    const result = await this.mongo.db.collection('artists')
      .findOne({ _id });

    if (! result) {
      res.status(404)
        .send();

      return;
    }

    result._id = UUID.fromBinary(result._id);

    res.status(200)
      .send(result);
  },
});

// ATUALIZAR ARTISTA ===============================================================================

fastify.put('/v1/artists/:_id', {
  schema: {
    params: {
      _id: { type: 'string', format: 'uuid' },
    },
    body: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
      },
    },
  },
  handler: async function (req, res) {
    const _id = UUID.fromString(req.params._id);

    const result = await this.mongo.db.collection('artists')
      .updateOne({ _id }, { $set: req.body });

    if (result.matchedCount === 0) {
      res.status(404)
        .send();

      return;
    }

    res.status(204)
      .send();
  },
});

// REMOVER ARTISTA =================================================================================

fastify.delete('/v1/artists/:_id', {
  schema: {
    params: {
      _id: { type: 'string', format: 'uuid' },
    },
  },
  handler: async function (req, res) {
    const _id = UUID.fromString(req.params._id);

    const result = await this.mongo.db.collection('artists')
      .deleteOne({ _id });

    if (result.deletedCount === 0) {
      res.status(404)
        .send();

      return;
    }

    res.status(204)
      .send();
  },
});

fastify.listen(process.env.PORT, '0.0.0.0');
