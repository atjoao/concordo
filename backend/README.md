## Usa

<details>
  <summary>MongoDB</summary>
  - <a>https://www.mongodb.com/try/download/community</a>
</details>

<details>
  <summary>FFMpeg</summary>
  - <a>https://www.ffmpeg.org/download.html</a>
</details>

## Como instalar

1. Instalar [Node](https://nodejs.org/en/download/current)
    - Verificar que Node está istalado (node -v)
    - Verificar que npm está instalado (npm -v)
2. Instalar [pnpm](https://pnpm.io/installation#using-npm)
    - Resumindo executar isto `npm install -g pnpm`
3. Executar `pnpm install`
4. Configurar .env de acordo com o .env.example (ou só usar export(unix?) / set(win32) )
5. Instalar FFMPeg para processar thumbnails/processar certos tipos de video
6. Executar `pnpm start`
