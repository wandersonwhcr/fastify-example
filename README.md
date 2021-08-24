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

HTTP/1.1 201 Created
Content-Length: 46
Content-Type: application/json; charset=utf-8
Date: Tue, 24 Aug 2021 23:16:44 GMT

{"_id":"452fae7f-7945-4442-bfc6-d59253f668cf"}
```

### Atualizar

```
curl --include --request PUT \
    --header 'Content-Type: application/json' \
    --data '{"name": "Ronnie James Dio"}' \
    http://artists.localhost/v1/artists/452fae7f-7945-4442-bfc6-d59253f668cf

HTTP/1.1 204 No Content
Date: Tue, 24 Aug 2021 23:23:04 GMT
```

### Remover

```
curl --include --request DELETE \
    http://artists.localhost/v1/artists/452fae7f-7945-4442-bfc6-d59253f668cf

HTTP/1.1 204 No Content
Date: Tue, 24 Aug 2021 23:30:14 GMT
```
