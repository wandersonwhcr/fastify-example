const axios = require('axios');
const uuid = require('uuid');
const { Binary } = require('mongodb');

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

// LISTAR ALBUNS ===================================================================================

fastify.get('/v1/albums', {
  schema: {
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          required: ['_id', 'name', 'artist'],
          properties: {
            _id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            artist: {
              type: 'object',
              required: ['_id'],
              properties: {
                _id: { type: 'string', format: 'uuid' },
              },
            },
          },
        },
      },
    },
  },
  handler: async function (req, res) {
    const result = await this.mongo.db.collection('albums').find().toArray();

    result.forEach((element) => {
      element._id = UUID.fromBinary(element._id);
      element.artist._id = UUID.fromBinary(element.artist._id);
    });

    res.status(200)
      .send(result);
  },
});

// ADICIONAR ALBUM =================================================================================

fastify.post('/v1/albums', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'artist'],
      properties: {
        name: { type: 'string' },
        artist: {
          type: 'object',
          required: ['_id'],
          properties: {
            _id: { type: 'string', format: 'uuid' },
          },
        },
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

    try {
      await axios.head(process.env.ARTISTS_URL + '/v1/artists/' + req.body.artist._id);
    } catch {
      res.status(422)
        .send();

      return;
    }

    req.body.artist._id = UUID.fromString(req.body.artist._id);

    await this.mongo.db.collection('albums')
      .insertOne({ _id, ...req.body });

    res.status(201)
      .send({ _id });
  },
});

// ATUALIZAR ALBUM =================================================================================

fastify.put('/v1/albums/:_id', {
  schema: {
    params: {
      _id: { type: 'string', format: 'uuid' },
    },
    body: {
      type: 'object',
      required: ['name', 'artist'],
      properties: {
        name: { type: 'string' },
        artist: {
          type: 'object',
          required: ['_id'],
          properties: {
            _id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
  },
  handler: async function (req, res) {
    const _id = UUID.fromString(req.params._id);

    req.body.artist._id = UUID.fromString(req.body.artist._id);

    const result = await this.mongo.db.collection('albums')
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

// REMOVER ALBUM ===================================================================================

fastify.delete('/v1/albums/:_id', {
  schema: {
    params: {
      _id: { type: 'string', format: 'uuid' },
    },
  },
  handler: async function (req, res) {
    const _id = UUID.fromString(req.params._id);

    const result = await this.mongo.db.collection('albums')
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
