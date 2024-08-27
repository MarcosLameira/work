#Configurando um ambiente de produção auto-hospedado

## Você precisa de auto-hospedagem?

WorkAdventure é uma plataforma poderosa e versátil que permite aos usuários criar ambientes virtuais imersivos e interativos
ambientes para colaboração remota, eventos e jogos. Como um projeto aberto, WorkAdventure oferece aos usuários a flexibilidade
e liberdade para hospedar a plataforma em seus próprios servidores. No entanto, a WorkAdventure auto-hospedada requer conhecimento técnico,
infraestrutura e manutenção, o que pode não ser viável ou prático para todos os usuários.

Para auto-hospedar o WorkAdventure, você precisará de:

- pelo menos um servidor para WorkAdventure, com IP público e nome DNS
- além disso, WorkAdventure exige 2 serviços adicionais: Jitsi e Coturn. Em uma configuração típica, esses serviços serão hospedados em 2 servidores adicionais (ambos com endereço IP público e nome DNS)
- forte conhecimento técnico em Docker e containers
- uma boa compreensão dos conceitos de rede
- ... e tempo (!), para acompanhar as atualizações (cerca de uma vez por mês)

Dependendo do seu caso de uso, você pode querer verificar a versão SAAS (ou seja, hospedada) do WorkAdventure.
Ele fornece:

- **Configuração rápida e fácil**: com apenas alguns cliques, você pode se inscrever, criar seu primeiro espaço virtual, convidar sua equipe ou amigos e começar a explorar e colaborar em tempo real
- **Atualizações automáticas**: você não precisa se preocupar em atualizar a plataforma sozinho. WorkAdventure é uma plataforma em rápida evolução
  tecnologia, com atualizações frequentes, correções de bugs e novos recursos. A versão SAAS cuida de todas as atualizações e garante que você sempre tenha acesso à melhor e mais recente versão da plataforma.
- **Um painel avançado**: você pode gerenciar seus espaços virtuais, usuários e obter direitos de acesso detalhados no painel.
  Você também pode criar e gerenciar seus próprios domínios e logotipos personalizados.
- **Custos e recursos mais baixos**: embora a auto-hospedagem do WorkAdventure possa parecer uma opção econômica à primeira vista,
  pode rapidamente se tornar caro e consumir muitos recursos no longo prazo. A auto-hospedagem requer não apenas hardware de servidor
  mas também custos de largura de banda, armazenamento e manutenção. Além disso, a auto-hospedagem requer conhecimento técnico, tempo e
  esforço para instalar, configurar e solucionar problemas da infraestrutura. A versão SAAS do WorkAdventure, por outro lado,
  oferece um modelo de preços pré-pago que se adapta ao seu uso e necessidades. Você paga apenas pelo que usa (não há necessidade de servidores de vídeo caros),
  e você não precisa se preocupar com investimentos iniciais, taxas ocultas ou custos imprevisíveis. E o mais importante,
  você contribui para tornar o WorkAdventure um produto sustentável 👍

Além disso, a versão WorkAdventure SAAS oferece um plano gratuito generoso. Acesse https://workadventu.re para começar imediatamente.

Ainda interessado em auto-hospedagem? Tudo bem! Leia abaixo.

## Uma visão de alto nível de um ambiente WorkAdventure

Para hospedar WorkAdventure você precisará hospedar:

- **WorkAdventure** em si
- **Coturn**: é um serviço que faz proxy do sinal de vídeo WebRTC caso o usuário esteja em uma rede que não permite
  conexões ponto a ponto. O Coturn é opcional, mas sem o Coturn, aproximadamente 15% dos usuários não conseguirão estabelecer
  uma conexão de áudio/vídeo.
- **Jitsi**: em grandes salas de reunião, o Jitsi é usado para transmitir streams de vídeo para todos os usuários.

```sereia
fluxograma LR
  
    subgráfico Servidores
    TrabalhoAventura
    Jitsi
    Coturno
    fim
    Navegador1["Seu navegador"]
    Navegador1 -> WorkAdventure
    Navegador1 -> Jitsi
    Navegador1 -> Coturn
```

> [!AVISO]  
> No restante deste documento, descreveremos como instalar o servidor WorkAdventure. Vamos deixar o Jitsi
> e Coturn instala fora do escopo.

Guia de instalação do Jitsi: https://jitsi.github.io/handbook/docs/devops-guide/  
Guia de instalação do Coturn: https://meetrix.io/blog/webrtc/coturn/installation.html

## Método de instalação para o servidor WorkAdventure

WorkAdventure é um conjunto de programas diferentes. Existem inúmeras maneiras de hospedar WorkAdventure. No passado, tivemos
vi pessoas usando Ansible, NixOS ou Kubernetes para hospedar WorkAdventure. Você pode hospedar cada componente em um local diferente
nome de domínio ou execute uma instalação de "domínio único". Os principais mantenedores deste projeto não podem apoiar todos os possíveis
métodos de instalação.

Portanto, estamos mantendo DOIS métodos de instalação:

1. usando Docker Compose
2. usando Kubernetes (gráfico Helm)

### Docker Compor

A maneira mais fácil de instalar o WorkAdventure se você não tiver um cluster Kubernetes é usar o Docker Compose.

- **WorkAdventure funciona como um conjunto de contêineres Docker.**
- **Fornecemos imagens do Docker para cada contêiner no registro do hub do Docker e um arquivo docker-compose para iniciar facilmente os contêineres.**
- **A instalação proposta é executada em um único domínio (você ainda precisará de 2 nomes de domínio adicionais para Jitsi e Coturn).**
- **Presumimos que você tenha um servidor físico com acesso root e Docker instalado. O servidor possui um endereço IP público.**

A instalação abaixo foi bem testada em cada versão e funciona.

É claro que cada ambiente de produção é diferente e este arquivo docker-compose não será
se adapta a todos os casos de uso. O arquivo é seu. Preencha gratuitamente para modificá-lo. Preencha gratuitamente para usá-lo como ponto de partida para hospedar o
solução no Kubernetes, se desejar.

Se você tiver necessidades específicas de implantação personalizada, a empresa WorkAdventure pode oferecer suporte pago. Não hesite em
entre em contato conosco em hello@workadventu.re. Também fornecemos suporte para integrar o WorkAdventure em seu aplicativo existente.

Clique aqui para ver o [guia de instalação do Docker Compose](../../../contrib/docker/README.md).

### Gráfico Helm para Kubernetes

Se você tiver um cluster Kubernetes, poderá usar o gráfico Helm para instalar o WorkAdventure.

O Helm Chart é bem testado em cada versão e funciona.
É mais recente que a instalação do Docker Compose e pode mudar com mais frequência no próximo mês. Portanto,
não garantimos (ainda) a ausência de alterações significativas entre versões secundárias.

Clique aqui para ver o [guia de instalação do gráfico do Helm](../../../contrib/helm/README.md).

### Métodos alternativos de instalação

Para qualquer dúvida relacionada a implantações fora do padrão, você pode perguntar à comunidade no Discord "server-sorcery"
canal: [![Discord](https://img.shields.io/discord/821338762134290432?label=Discord)](https://discord.gg/G6Xh9ZM9aR)
