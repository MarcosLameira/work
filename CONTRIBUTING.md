# Contribuindo para o WorkAdventure

Você está procurando ajudar no WorkAdventure? Ótimo, sinta-se à vontade e leia as seções a seguir para saber como
fazer perguntas e como trabalhar em algo.

## Contribuições que estamos buscando

Adoramos receber contribuições da nossa comunidade — você!

Há muitas maneiras de contribuir, desde escrever tutoriais ou postagens de blog, melhorar a documentação,
enviar relatórios de bugs e solicitações de recursos ou escrever código que pode ser incorporado ao próprio WorkAdventure.

## Contribuindo com recursos externos

Você pode compartilhar seu trabalho em mapas / artigos / vídeos relacionados ao WorkAdventure em nossa lista [awesome-workadventure](https://github.com/workadventure/awesome-workadventure).

## Documentação do desenvolvedor

A documentação direcionada aos desenvolvedores pode ser encontrada em [`/docs/dev`](docs/dev/)

## Usando o rastreador de problemas

Primeiras coisas: **NÃO relate vulnerabilidades de segurança em problemas públicos!**.
Leia o [guia de segurança](SECURITY.md) para saber quem deve fazer uma divulgação de segurança para a equipe principal do WorkAdventure.

Você pode usar o [rastreador de problemas do GitHub](https://github.com/thecodingmachine/workadventure/issues) para:

- Enviar relatórios de bugs
- Solicitar solicitações de recursos

Se você tiver perguntas mais gerais, um bom lugar para perguntar é [nosso servidor Discord](https://discord.gg/G6Xh9ZM9aR).

Finalmente, você pode vir e falar com a equipe principal do WorkAdventure... no WorkAdventure, é claro! [Nossos escritórios estão aqui](https://play.staging.workadventu.re/@/tcm/workadventure/wa-village).

## Solicitações de pull

Boas solicitações de pull - patches, melhorias, novos recursos - são uma ajuda fantástica. Elas devem permanecer focadas no escopo
e evitar conter confirmações não relacionadas.

Por favor, pergunte primeiro antes de embarcar em qualquer solicitação de pull significativa (por exemplo, implementar recursos, refatorar código),
caso contrário, você corre o risco de gastar muito tempo trabalhando em algo que os desenvolvedores do projeto podem não querer mesclar
no projeto.

Você pode nos perguntar no [Discord](https://discord.gg/G6Xh9ZM9aR) ou nos [problemas do GitHub](https://github.com/thecodingmachine/workadventure/issues).

### Linting seu código

Antes de fazer o commit, certifique-se de instalar o hook de pré-commit "Prettier" que reformatará seu código para nosso estilo de codificação.

Para habilitar o hook de pré-commit "Prettier", na raiz do projeto, execute:

```console
$ # Isso instala todas as dependências
$ npm install
$ # Isso realmente instala os hooks de pré-commit.
$ npm run prepare
```

Se você não tiver o hook precommit instalado (ou se você tiver feito commit do código antes de instalar o hook precommit), você precisará
executar o code linting manualmente:

```console
$ docker-compose exec play npm run pretty
$ docker-compose exec back npm run pretty
```

### Fornecendo testes

O WorkAdventure é baseado em um mecanismo de videogame (Phaser), e videogames não são os programas mais fáceis de testar unidades.

No entanto, se seu código puder ser testado em unidades, forneça um teste de unidade (usamos Jasmine) ou um teste de ponta a ponta (usamos Playwright).

Se você estiver fornecendo um novo recurso, você deve configurar um mapa de teste no diretório `maps/tests`. O mapa de teste deve conter
algum texto descritivo descrevendo como testar o recurso.

* se os recursos forem testados manualmente, você deve modificar o arquivo `maps/tests/index.html` para adicionar uma referência
ao seu mapa de teste recém-criado
* se os recursos puderem ser testados automaticamente, forneça um teste de ponta a ponta

#### Executando testes de ponta a ponta

Testes de ponta a ponta estão disponíveis no diretório "/tests".

Mais informações sobre a execução de testes de ponta a ponta podem ser encontradas em [`/tests/README`](/tests/README.md).

### Uma redação incorreta ou um idioma ausente

Se você notar um erro de tradução ou idioma ausente, pode nos ajudar seguindo a documentação [como traduzir](docs/dev/how-to-translate.md).
