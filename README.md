# Agenda

<p>Sistema de agendamento para 20 funcionários com horários individuais.</p>
<p>Permite marcação automática conforme disponibilidade, envio de notificações e gestão de bloqueios por administradores.</p>



## Project setup

```bash
$ pnpm install
```

## Configurar banco de dados com docker

```bash
$ docker-compose up -d
```

## Configurar .env

```bash
$ npx prisma migrate dev
```


## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

---

# Criar imagem docker
```sh
docker build -t agenda-backend .
```
> * -t my-nestjs-app: Marca a imagem com o nome .my-nestjs-app

> * .: Indica o diretório atual como o contexto de compilação.

## Executa imagem
```sh
docker run -p 3000:3000 agenda-backend
```

## Criar novo recurso completo

```sh
# caso não tenha instalado
npm i -g @nestjs/cli 

# criar recurso
nest g resource nome-da-rota
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
