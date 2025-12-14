# Concordo

> Este projeto foi realizado para prova final de ano

# O que é o Concordo

Concordo é um projeto de chat, este serviu para experimentar desenvolvimento, com js/ts/mongodb/react/expressjs/socketio

# Como proceder com a instalação - Docker

A configuração do concordo pode ser feita com docker, apenas por clonar este repositório, passo a indicar os passos para a instalação

1. Ter [`docker`](https://www.docker.com/) instalado
2. Ter [`git`](https://git-scm.com/) instaldo
3. Executar `git clone https://github.com/atjoao/concordo.git source`
4. Remover .example de [`compose.yml`](https://github.com/atjoao/concordo/blob/main/compose.yaml.example) (este vai estar dentro da pasta source)
5. Copiar o [`compose.yml`](https://github.com/atjoao/concordo/blob/main/compose.yaml.example) para a pasta anterior
   ```
   |-> pasta
   |-> compose.yml
   |--> source
   ```
6. Como este ficheiro é apenas de um exemplo de como configurei no meu servidor remover linhas que se relacionam a nginx ou configurar nginx de acordo com [`how2host.it`](https://how2host.it)
7. Se não quer configurar nginx é só remover todas as linhas relacionadas com `nginx_default` e dar as portas corretas (este é adicionado por meter da seguinte maneira)

```yml
networks:
  - internal # este não é necessário no frontend
ports:
  - "3000:3000" # porta do container e porta exterior
```

| serviço  | porta default |
| -------- | ------------- |
| backend  | 3000          |
| server   | 3001          |
| frontend | 6969          |

> [!WARNING]
> Não é recomendado adicionar portas ao serviço mongodb \
> Não é recomendado adicionar frontend a rede interna criada pelo container

10. Configurar os valores de acordo com o nome para serviços que podem ser ligados internamente recomendo usar o nome deles exemplo `mongodb://mongodb:27010` o mesmo se aplica para outros serviços dentro deste ficheiro
11. Trocar o serverIp no .env do frontned
12. dentro da pasta onde esta o `compose.yml` executar `docker compose up -d --build`
13. Abrir o concordo em `https://localhost:6969`

# Como proceder com a instalação - Sem Docker

1. Ter [`node`](https://nodejs.org/en) instalado ou alguma javascript runtime idk
2. Ter [`git`](https://git-scm.com/) instaldo
3. Copiar isto para um ficheiro `install.cmd`
   ```batch
   start cmd.exe /c "cd server && npm install"
   start cmd.exe /c "cd backend && npm install"
   start cmd.exe /c "cd frontend && npm install"
   ```
4. Configurar todos os `.env` dentro da sua respectiva pasta
5. Após instalar copiar isto para `start.cmd`
   (para o frontend precisa de fazer o comando `npm run build` antes de executar estes)
   ```batch
   start cmd.exe /c "cd server && npm run start"
   start cmd.exe /c "cd backend && npm run start"
   start cmd.exe /c "cd frontend && npm run start"
   ```

# Funcionalidades configuraveis do concordo

Estas podem ser configuradas a partir de variaveis de ambiente

| servico | variavel                 | tipo de valor | default |
| ------- | ------------------------ | ------------- | ------- |
| backend | ADMIN_PANEL              | boolean       | false   |
| backend | ADMIN_PANEL_DEFAULT_USER | string        | NULL    |
| backend | VERIFICATION             | boolean       | false   |

> verification representa os sistemas de verificação de conta no concordo este requer configurar o email

> admin_panel é o painel de administração do concordo este pode ser acedido a partir do endereço do backend, este tambem requer ADMIN_PANEL_DEFAULT_USER

> ADMIN_PANEL_DEFAULT_USER tem de ser uma conta válida e verificada no concordo

> [!NOTE]
> Recomendado gerar chaves secretas com `openssl enc -aes-256-cbc -k secret -P -md sha1` e preencher de acordo com os campos devidos
