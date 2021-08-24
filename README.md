# fastify-example

## Artistas

### Listar

```
curl --include --request GET \
    http://artists.localhost/v1/artists

HTTP/1.1 200 OK
Content-Length: 2
Content-Type: application/json; charset=utf-8
Date: Tue, 24 Aug 2021 22:39:04 GMT

[]
```

### Adicionar

```
curl --include --request POST \
    --header 'Content-Type: application/json' \
    --data '{"name": "Dio"}' \
    http://artists.localhost/v1/artists
```
