

Live demo [here](https://play.staging.workadventu.re/@/tcm/workadventure/wa-village).

# WorkAdventure
WorkAdventure é um espaço de trabalho colaborativo baseado na web apresentado na forma de um Videogame de 16 bits.
No WorkAdventure você pode circular pelo seu escritório e conversar com seus colegas (usando um sistema de videochat, acionado quando você aborda alguém).
Veja mais recursos para seu escritório virtual: https://workadventu.re/virtual-office

## Recursos da comunidade
Confira os recursos desenvolvidos pela comunidade WorkAdventure em [awesome-workadventure](https://github.com/workadventure/awesome-workadventure)

## Configurando um ambiente de produção
Oferecemos suporte a duas maneiras de configurar um ambiente de produção:
- usando Docker Compose
- ou usando um gráfico Helm para Kubernetes

Consulte o guia [Configurando um ambiente de produção](docs/others/self-hosting/install.md) para obter mais informações.

> [!NOTA]
> WorkAdventure também fornece uma [versão hospedada](https://workadventu.re) do aplicativo. Usar a versão hospedada é 
> a maneira mais fácil de começar e nos ajuda a manter o projeto vivo.

## Configurando um ambiente de desenvolvimento

> [!NOTA]
> Estas instruções de instalação são apenas para desenvolvimento local. Eles não funcionarão
> servidores remotos, pois ambientes locais não possuem certificados HTTPS.

Instale o Docker e clone este repositório.

> [!AVISO]
> Se você estiver usando Windows, certifique-se de que o caractere de fim de linha não seja modificado pelo processo de clonagem configurando
> a configuração `core.autocrlf` como false: `git config --global core.autocrlf false`
Correr:

```
cp .env.template .env
docker-compose up
```

O ambiente começará.

Agora você deve conseguir navegar até http://play.workadventure.localhost/ e ver o aplicativo.
Você pode visualizar o painel do Traefik em http://traefik.workadventure.localhost

Nota: em alguns sistemas operacionais, você precisará adicionar esta linha ao seu arquivo `/etc/hosts`:
**/etc/hosts**
```
127.0.0.1 oidc.workadventure.localhost redis.workadventure.localhost play.workadventure.localhost traefik.workadventure.localhost matriz.workadventure.localhost extra.workadventure.localhost icon.workadventure.localhost map-storage.workadventure.localhost uploader.workadventure.localhost mapas.workadventure.localhost api.workadventure.localhost front.workadventure.localhost
```

Você também pode iniciar o WorkAdventure + um servidor de teste OpenID Connect usando:
```console
$ docker-compose -f docker-compose.yaml -f docker-compose-oidc.yaml up
```

(O usuário de teste é "User1" e sua senha é "pwd")
### Solução de problemas
Consulte nosso [guia de solução de problemas](docs/dev/troubleshooting.md).
