<h1 align="center"> Study Rats </h1>
<a id="readme-top"></a>

<br />
<div align="center">


  <p align="center">
    Projeto criando com Java e Spring para aplicar e ampliar conhecimentos
    <br />
    <br />
  </p>
</div>

## Como rodar com Docker

### Pré-requisitos
- Docker e Docker Compose instalados

### Executando a aplicação
```bash
# Clone o repositório (se necessário)
# cd studyrats

# Execute com docker-compose (irá criar e configurar o MySQL automaticamente)
docker-compose up --build

# Ou execute em background
docker-compose up -d --build
```

A aplicação estará disponível em `http://localhost:9090`

### Parar a aplicação
```bash
docker-compose down
```

### Parar e remover volumes (limpar dados do banco)
```bash
docker-compose down -v
```

<h3 align="center">Recursos que quero usar</h3>

- [ ] S3 
- [ ] Lambda
- [ ] Api Gateway
- [x] OAUTH
- [ ] RDS PostgreSQL

<h3 align="center">Passos a seguir</h3>

- [x] Criar projeto Spring
- [x] Criar endpoints basicos Login, cadastro,checkin grupo, ranking - Sem validações 
- [x] Incluir Hateoas + Hal
- [x] Conectar local MySQL
- [x] Checkin -> Apenas um por dia, Titulo, descrição do que aprendeu, tempo de estudo
- [ ] Incluir Imagem no checkin
- [x] Incluir OAUTH + JWT + Validação de endpoint
- [x] Rodar no Docker

