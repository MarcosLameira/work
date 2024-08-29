# Aplicativo de desktop

O componente de desktop é um aplicativo electron dentro de `./electron/`. Ele usa uma configuração híbrida com base em dois componentes principais:
- Um `local-app` empacotado no aplicativo electron com duas partes principais:
- Uma barra lateral para mostrar a lista de servidores, com o servidor selecionado no momento
- Uma página principal que é usada para gerenciar servidores e mostrar outras páginas "locais" como as configurações do aplicativo de desktop
- Um BrowserView (frequentemente chamado de `appView` ou `app`) mostrando o frontend real de uma implantação externa do WorkAdventure.
Se um servidor for selecionado, o BrowserView / `appView` está sobrepondo toda a parte principal diretamente na barra lateral.

## Desenvolvimento

```bash
# iniciar aplicativo local no modo de observação
cd local-app && yarn dev

# iniciar o aplicativo eletrônico no modo de observação
cd electron && LOCAL_APP_URL=http://localhost:3000 yarn dev

# ou crie um executável executando:
cd electron && yarn bundle
```

## API for front

TODO:

```ts
if (window?.WorkAdventureDesktopApi?.desktop) {
  alert('Yeah you are using the desktop app ;)');
}

let muted = false;

window?.WorkAdventureDesktopApi?.onMutedKeyPress((event) => {
  if (muted) {
    document.getElementById("info-box").innerHTML =
      "Ready to speak! Press ctrl-alt-m to mute.";
  } else {
    document.getElementById("info-box").innerHTML =
      "Muted! Press ctrl-alt-m to unmute again.";
  }
  muted = !muted;
});

window.WorkAdventureDesktopApi.notify("Hello from front");
```
