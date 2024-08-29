# Testes de ponta a ponta
Este diretório contém testes automatizados de ponta a ponta.

## Instalação
```bash
npm install
npx playwright install --with-deps
```
## Digitação de build
Para remover avisos no seu IDE, você precisa compilar as tipificações da API de script.
Executar:
```console
docker-compose exec play npm run build-typings
```
Se você alterar a API de script, precisará executar novamente este comando.

## Executar em ambiente de desenvolvimento
Inicie o WorkAdventure com:
```bash
docker-compose -f docker-compose.yaml -f docker-compose-oidc.yaml up -d
```
Aguarde 2-3 minutos para que o ambiente inicie, então:
Inicie os testes com:
```bash
npm run test
```
Em desenvolvimento, se você quiser executar um teste específico no modo "headed" (modo visível), apenas com o Chromium, execute:
```bash
npm run test-headed -- tests/[your_test_file.ts]
```
## Executar em ambiente de produção
Start WorkAdventure with:
```bash
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yaml -f docker-compose-oidc.yaml -f docker-compose.e2e.yml up -d --build
```
Start the tests with:
```bash
npm run test-prod-like
```
## Executar testes selecionados
Testes de ponta a ponta podem levar um tempo para serem executados. Para executar apenas um teste em um navegador, use:
```bash
npm run test -- [name of the test file] --project=[chromium|firefox|webkit]
```
Para executar testes no modo "headed", somente para Chromium, execute:
```bash
npm run test-headed-chrome -- [name of the test file]
```
Como alternativa, para executar um teste no modo "headed", apenas para Firefox, execute:
```bash
npm run test-headed-firefox -- [name of the test file]
```
