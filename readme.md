<!-- !/usr/bin/env markdown
-*- coding: utf-8 -*-
region header
Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

License
-------

This library written by Torben Sickert stands under a creative commons naming
4.0 international license.
See https://creativecommons.org/licenses/by/4.0/deed.de
endregion -->

<!--|deDE:Projektstatus-->
<!--|frFR:Statut du projet-->
Project Status
--------------

[![npm](https://img.shields.io/npm/v/web-node?color=%23d55e5d&label=npm%20package%20version&logoColor=%23d55e5d&style=for-the-badge)](https://www.npmjs.com/package/web-node)
[![npm downloads](https://img.shields.io/npm/dy/web-node.svg?style=for-the-badge)](https://www.npmjs.com/package/web-node)

[![build](https://img.shields.io/github/actions/workflow/status/thaibault/web-node/build.yaml?style=for-the-badge)](https://github.com/thaibault/web-node/actions/workflows/build.yaml)
[![build push package](https://img.shields.io/github/actions/workflow/status/thaibault/web-node/build-package-and-push.yaml?label=build%20push%20package&style=for-the-badge)](https://github.com/thaibault/web-node/actions/workflows/build-package-and-push.yaml)

[![check types](https://img.shields.io/github/actions/workflow/status/thaibault/web-node/check-types.yaml?label=check%20types&style=for-the-badge)](https://github.com/thaibault/web-node/actions/workflows/check-types.yaml)
[![lint](https://img.shields.io/github/actions/workflow/status/thaibault/web-node/lint.yaml?label=lint&style=for-the-badge)](https://github.com/thaibault/web-node/actions/workflows/lint.yaml)
[![test](https://img.shields.io/github/actions/workflow/status/thaibault/web-node/test-coverage-report.yaml?label=test&style=for-the-badge)](https://github.com/thaibault/web-node/actions/workflows/test-coverage-report.yaml)

[![code coverage](https://img.shields.io/coverallsCoverage/github/thaibault/web-node?label=code%20coverage&style=for-the-badge)](https://coveralls.io/github/thaibault/web-node)

[![deploy web documentation](https://img.shields.io/github/actions/workflow/status/thaibault/web-node/deploy-web-documentation.yaml?label=deploy%20web%20documentation&style=for-the-badge)](https://github.com/thaibault/web-node/actions/workflows/deploy-web-documentation.yaml)
[![web documentation](https://img.shields.io/website-up-down-green-red/https/tsickert.com/web-node.svg?label=web-documentation&style=for-the-badge)](https://tsickert.com/web-node)

[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=for-the-badge&logo=codesandbox)](https://githubbox.com/thaibault/web-node)

<!--|deDE:Einsatzmöglichkeiten-->
<!--|frFR:Cas d'utilisation-->
Use case
--------

Assemble a Node.js backend from plugins. Each plugin is an npm package or a
local folder that brings its own configuration and reacts to lifecycle hooks.
web-node finds all plugins, merges their configurations into one, orders them
by their dependencies, starts their services and shuts everything down
cleanly. During development changed configurations and code can be reloaded
without a restart.
<!--deDE:
    Setzen Sie ein Node.js-Backend aus Plugins zusammen. Jedes Plugin ist ein
    npm-Paket oder ein lokaler Ordner, der seine eigene Konfiguration
    mitbringt und auf Lebenszyklus-Hooks reagiert. web-node findet alle
    Plugins, führt ihre Konfigurationen zu einer zusammen, sortiert sie nach
    ihren Abhängigkeiten, startet ihre Dienste und fährt alles sauber
    herunter. Während der Entwicklung können geänderte Konfigurationen und
    geänderter Code ohne Neustart nachgeladen werden.
-->
<!--frFR:
    Assemblez un backend Node.js à partir de plugins. Chaque plugin est un
    paquet npm ou un dossier local qui apporte sa propre configuration et
    réagit aux hooks du cycle de vie. web-node trouve tous les plugins,
    fusionne leurs configurations en une seule, les ordonne selon leurs
    dépendances, démarre leurs services et arrête proprement l'ensemble.
    Pendant le développement, les configurations et le code modifiés peuvent
    être rechargés sans redémarrage.
-->

Available plugins:
<!--deDE:Verfügbare Plugins:-->
<!--frFR:Plugins disponibles:-->

- [application-server](https://tsickert.com/application-server-web-node-plugin):
  HTTP server for files and your own routes.<!--deDE:HTTP-Server für Dateien und eigene Routen.--><!--frFR:Serveur HTTP pour les fichiers et vos propres routes.-->
- [couchdb](https://tsickert.com/couchdb-web-node-plugin): CouchDB server
  with models, validation and authentication.<!--deDE:CouchDB-Server mit Modellen, Validierung und Authentifizierung.--><!--frFR:Serveur CouchDB avec modèles, validation et authentification.-->
- [ejs](https://tsickert.com/ejs-web-node-plugin): Renders EJS templates.<!--deDE:Rendert EJS-Templates.--><!--frFR:Effectue le rendu de templates EJS.-->
- [nginx](https://tsickert.com/nginx-web-node-plugin): Runs nginx with a
  generated proxy configuration.<!--deDE:Betreibt nginx mit einer generierten Proxy-Konfiguration.--><!--frFR:Exécute nginx avec une configuration de proxy générée.-->
- [pre-render](https://tsickert.com/pre-render-web-node-plugin): Pre-renders
  pages of web applications.<!--deDE:Rendert Seiten von Webanwendungen vor.--><!--frFR:Effectue le pré-rendu des pages d'applications web.-->

<div class="wd-table-of-contents">
    <h2 id="content">Content<!--deDE:Inhalt--><!--frFR:Contenu--></h2>
    <!--wd-table-of-contents-->
</div>

<!--|deDE:Schnellstart-->
<!--|frFR:Démarrage rapide-->
Quick start
-----------

```bash
npm install web-node clientnode core-js
```

Your application is a plugin itself. Its configuration lives under the key
"webNode" in its "package.json", its hooks are the functions exported by its
"main" file:
<!--deDE:
    Ihre Anwendung ist selbst ein Plugin. Ihre Konfiguration steht unter dem
    Schlüssel "webNode" in ihrer "package.json", ihre Hooks sind die von ihrer
    "main"-Datei exportierten Funktionen:
-->
<!--frFR:
    Votre application est elle-même un plugin. Sa configuration se trouve
    sous la clé "webNode" de son "package.json", ses hooks sont les fonctions
    exportées par son fichier "main":
-->

```JSON
{
  "name": "my-app",
  "type": "module",
  "main": "index.js",
  "webNode": {
    "myApp": {
      "greeting": "Hello"
    }
  }
}
```

```JavaScript
// index.js
export const initialize = ({configuration, plugins}) => {
    console.log(configuration.myApp.greeting)
    console.log('Plugins:', plugins.map((plugin) => plugin.internalName))
}
export const exit = () => console.log('Bye')
```

Start it in the project folder:
<!--deDE:Starten Sie es im Projektordner:-->
<!--frFR:Démarrez-le dans le dossier du projet:-->

```bash
npx web-node
```

<!--|deDE:Plugins-->
<!--|frFR:Plugins-->
Plugins
-------

web-node loads these plugins:
<!--deDE:web-node lädt diese Plugins:-->
<!--frFR:web-node charge ces plugins:-->

- Your application itself.<!--deDE:Ihre Anwendung selbst.--><!--frFR:Votre application elle-même.-->
- Every package in "node_modules" whose name ends with "web-node-plugin".<!--deDE:Jedes Paket in "node_modules", dessen Name auf "web-node-plugin" endet.--><!--frFR:Chaque paquet de "node_modules" dont le nom se termine par "web-node-plugin".-->
- Every folder in "plugins" of your project.<!--deDE:Jeder Ordner in "plugins" Ihres Projekts.--><!--frFR:Chaque dossier de "plugins" de votre projet.-->

A plugin is named in camel case without the suffix, e.g.
"application-server-web-node-plugin" becomes "applicationServer". This name
is its key in the shared configuration. Its configuration is read from the
key "webNode" in "package.json" and an optional "private-package.json", e.g.
for secrets not to be committed. Its hooks come from the file named in
"main", otherwise from "index.js":
<!--deDE:
    Ein Plugin wird in Camel Case ohne Suffix benannt, z. B. wird
    "application-server-web-node-plugin" zu "applicationServer". Dieser Name
    ist sein Schlüssel in der gemeinsamen Konfiguration. Seine Konfiguration
    wird aus dem Schlüssel "webNode" in der "package.json" und einer
    optionalen "private-package.json" gelesen, z. B. für Geheimnisse, die
    nicht eingecheckt werden sollen. Seine Hooks kommen aus der unter "main"
    angegebenen Datei, sonst aus "index.js":
-->
<!--frFR:
    Un plugin est nommé en camel case sans le suffixe, par exemple
    "application-server-web-node-plugin" devient "applicationServer". Ce nom
    est sa clé dans la configuration commune. Sa configuration est lue depuis
    la clé "webNode" du "package.json" et d'un "private-package.json"
    optionnel, par exemple pour des secrets à ne pas versionner. Ses hooks
    proviennent du fichier indiqué dans "main", sinon de "index.js":
-->

```JSON
{
  "name": "clock",
  "type": "module",
  "main": "index.js",
  "webNode": {
    "clock": {
      "interval": 1000,
      "ticks": 3
    }
  }
}
```

```JavaScript
// plugins/clock/index.js
export const preLoadService = ({services}) => {
    services.clock = {count: 0}
}
export const loadService = ({configuration: {clock}, services}) => ({
    clock: new Promise((resolve) => {
        const timer = setInterval(() => {
            services.clock.count += 1
            if (services.clock.count >= clock.ticks) {
                clearInterval(timer)
                resolve()
            }
        }, clock.interval)
    })
})
```

A plugin which needs another one to be loaded before lists it in
"dependencies", e.g. "webNode": {"myApp": {"dependencies": ["clock"]}}.
"core.interDependencies" adds such relations from outside.
<!--deDE:
    Ein Plugin, das ein anderes vor sich geladen benötigt, führt es unter
    "dependencies" auf, z. B. "webNode": {"myApp": {"dependencies":
    ["clock"]}}. "core.interDependencies" ergänzt solche Beziehungen von
    außen.
-->
<!--frFR:
    Un plugin qui a besoin qu'un autre soit chargé avant lui le liste dans
    "dependencies", par exemple "webNode": {"myApp": {"dependencies":
    ["clock"]}}. "core.interDependencies" ajoute de telles relations depuis
    l'extérieur.
-->

<!--|deDE:Lebenszyklus-->
<!--|frFR:Cycle de vie-->
Lifecycle
---------

Each hook is called for every plugin in dependency order and gets a state
object with "configuration", "plugins", "services", "servicePromises" and the
plugin API "pluginAPI". Plugins which do not export a hook are skipped:
<!--deDE:
    Jeder Hook wird für jedes Plugin in Abhängigkeitsreihenfolge aufgerufen
    und erhält ein Zustandsobjekt mit "configuration", "plugins",
    "services", "servicePromises" und der Plugin-API "pluginAPI". Plugins,
    die einen Hook nicht exportieren, werden übersprungen:
-->
<!--frFR:
    Chaque hook est appelé pour chaque plugin dans l'ordre des dépendances et
    reçoit un objet d'état avec "configuration", "plugins", "services",
    "servicePromises" et l'API des plugins "pluginAPI". Les plugins qui
    n'exportent pas un hook sont ignorés:
-->

1. "initialize": All plugins and their configurations are loaded.<!--deDE:"initialize": Alle Plugins und ihre Konfigurationen sind geladen.--><!--frFR:"initialize": Tous les plugins et leurs configurations sont chargés.-->
2. "preConfigurationLoaded" and "postConfigurationLoaded": Adjust the merged
   configuration.<!--deDE:"preConfigurationLoaded" und "postConfigurationLoaded": Passen Sie die zusammengeführte Konfiguration an.--><!--frFR:"preConfigurationLoaded" et "postConfigurationLoaded": Ajustez la configuration fusionnée.-->
3. "preLoadService": Create service instances in "services".<!--deDE:"preLoadService": Erzeugen Sie Dienstinstanzen in "services".--><!--frFR:"preLoadService": Créez des instances de service dans "services".-->
4. "loadService": Start services. Return an object mapping service names to
   promises which resolve when the service has finished. Before and after
   each plugin's call "preLoad&lt;Name&gt;Service" and
   "postLoad&lt;Name&gt;Service" run, e.g. "postLoadClockService".<!--deDE:"loadService": Starten Sie Dienste. Geben Sie ein Objekt zurück, das Dienstnamen auf Promises abbildet, die sich erfüllen, wenn der Dienst beendet ist. Vor und nach dem Aufruf jedes Plugins laufen "preLoad&lt;Name&gt;Service" und "postLoad&lt;Name&gt;Service", z. B. "postLoadClockService".--><!--frFR:"loadService": Démarrez les services. Retournez un objet associant des noms de service à des promesses résolues lorsque le service est terminé. Avant et après l'appel de chaque plugin s'exécutent "preLoad&lt;Name&gt;Service" et "postLoad&lt;Name&gt;Service", par exemple "postLoadClockService".-->
5. "postLoadService": All services are running.<!--deDE:"postLoadService": Alle Dienste laufen.--><!--frFR:"postLoadService": Tous les services fonctionnent.-->
6. "shouldExit": All services have finished or "Ctrl+C" was pressed. Close
   connections here, asynchronous work is still possible.<!--deDE:"shouldExit": Alle Dienste sind beendet oder "Strg+C" wurde gedrückt. Schließen Sie hier Verbindungen, asynchrone Arbeit ist noch möglich.--><!--frFR:"shouldExit": Tous les services sont terminés ou "Ctrl+C" a été pressé. Fermez ici les connexions, un travail asynchrone est encore possible.-->
7. "exit": The process ends now, plugins are called in reverse order and only
   synchronous work is possible.<!--deDE:"exit": Der Prozess endet jetzt, Plugins werden in umgekehrter Reihenfolge aufgerufen und nur synchrone Arbeit ist möglich.--><!--frFR:"exit": Le processus se termine maintenant, les plugins sont appelés dans l'ordre inverse et seul un travail synchrone est possible.-->

If a hook throws, "error" is called with the error in "data", followed by
"shouldExit", and the process exits with code 1.
<!--deDE:
    Wirft ein Hook einen Fehler, wird "error" mit dem Fehler in "data"
    aufgerufen, danach "shouldExit", und der Prozess endet mit Code 1.
-->
<!--frFR:
    Si un hook lève une erreur, "error" est appelé avec l'erreur dans "data",
    puis "shouldExit", et le processus se termine avec le code 1.
-->

Plugins can define their own hooks. Call them for all plugins via
"pluginAPI.callStack". It resolves to the value returned by the last
plugin:
<!--deDE:
    Plugins können eigene Hooks definieren. Rufen Sie sie für alle Plugins
    über "pluginAPI.callStack" auf, das Ergebnis des letzten Plugins wird
    zurückgegeben:
-->
<!--frFR:
    Les plugins peuvent définir leurs propres hooks. Appelez-les pour tous
    les plugins via "pluginAPI.callStack", le résultat du dernier plugin est
    retourné:
-->

```JavaScript
export const postLoadService = async (state) => {
    await state.pluginAPI.callStack({...state, hook: 'clockStarted'})
}
```

With TypeScript, "web-node/type" provides "PluginHandler" for the hook
signatures and the state types.
<!--deDE:
    Mit TypeScript liefert "web-node/type" "PluginHandler" für die
    Hook-Signaturen sowie die Zustandstypen.
-->
<!--frFR:
    Avec TypeScript, "web-node/type" fournit "PluginHandler" pour les
    signatures des hooks ainsi que les types d'état.
-->

<!--|deDE:Konfiguration-->
<!--|frFR:Configuration-->
Configuration
-------------

All plugin configurations are merged into one object in plugin order, so a
plugin can change the configuration of the plugins it depends on, e.g. your
application sets "applicationServer.port". Values can be computed with
"__evaluate__"; available are e.g. "currentPath", "path", "fs", "now" and
"webNodePath":
<!--deDE:
    Alle Plugin-Konfigurationen werden in Plugin-Reihenfolge zu einem Objekt
    zusammengeführt, sodass ein Plugin die Konfiguration der Plugins ändern
    kann, von denen es abhängt, z. B. setzt Ihre Anwendung
    "applicationServer.port". Werte können mit "__evaluate__" berechnet
    werden; verfügbar sind z. B. "currentPath", "path", "fs", "now" und
    "webNodePath":
-->
<!--frFR:
    Toutes les configurations des plugins sont fusionnées en un seul objet
    dans l'ordre des plugins, de sorte qu'un plugin peut modifier la
    configuration des plugins dont il dépend, par exemple votre application
    définit "applicationServer.port". Les valeurs peuvent être calculées avec
    "__evaluate__"; sont disponibles par exemple "currentPath", "path", "fs",
    "now" et "webNodePath":
-->

```JSON
{
  "webNode": {
    "applicationServer": {
      "hostName": {
        "__evaluate__": "process.env.HOST_NAME ?? '127.0.0.1'"
      },
      "port": 8080
    }
  }
}
```

Command line arguments are merged last and win over all files:
<!--deDE:
    Kommandozeilenargumente werden zuletzt zusammengeführt und haben
    Vorrang vor allen Dateien:
-->
<!--frFR:
    Les arguments de ligne de commande sont fusionnés en dernier et
    l'emportent sur tous les fichiers:
-->

```bash
npx web-node '{applicationServer: {port: 9000}, core: {debug: true}}'
```

The section "core" configures web-node itself:
<!--deDE:Der Abschnitt "core" konfiguriert web-node selbst:-->
<!--frFR:La section "core" configure web-node lui-même:-->

- "debug": Logs more and rethrows errors instead of only logging them.<!--deDE:"debug": Protokolliert mehr und wirft Fehler erneut, statt sie nur zu protokollieren.--><!--frFR:"debug": Journalise davantage et relance les erreurs au lieu de seulement les journaliser.-->
- "plugin.hotReloading": Reloads changed files, see below.<!--deDE:"plugin.hotReloading": Lädt geänderte Dateien nach, siehe unten.--><!--frFR:"plugin.hotReloading": Recharge les fichiers modifiés, voir ci-dessous.-->
- "plugin.directories": Where plugins are searched and which folder names
  count as plugins.<!--deDE:"plugin.directories": Wo nach Plugins gesucht wird und welche Ordnernamen als Plugins gelten.--><!--frFR:"plugin.directories": Où les plugins sont recherchés et quels noms de dossier comptent comme plugins.-->
- "plugin.configuration": File names and keys plugin configurations are read
  from.<!--deDE:"plugin.configuration": Dateinamen und Schlüssel, aus denen Plugin-Konfigurationen gelesen werden.--><!--frFR:"plugin.configuration": Noms de fichier et clés depuis lesquels les configurations des plugins sont lues.-->
- "interDependencies": Additional dependencies between plugins.<!--deDE:"interDependencies": Zusätzliche Abhängigkeiten zwischen Plugins.--><!--frFR:"interDependencies": Dépendances supplémentaires entre plugins.-->

<!--|deDE:Hot Reloading-->
<!--|frFR:Rechargement à chaud-->
### Hot reloading

With "core.plugin.hotReloading" enabled, web-node checks before each hook
call whether a plugin configuration or hook file has changed. Changed
configurations are merged again between "preConfigurationHotLoaded" and
"postConfigurationHotLoaded", changed hook files are imported again and
announced via "apiFileReloaded":
<!--deDE:
    Ist "core.plugin.hotReloading" aktiviert, prüft web-node vor jedem
    Hook-Aufruf, ob sich eine Plugin-Konfiguration oder Hook-Datei geändert
    hat. Geänderte Konfigurationen werden zwischen
    "preConfigurationHotLoaded" und "postConfigurationHotLoaded" erneut
    zusammengeführt, geänderte Hook-Dateien werden neu importiert und über
    "apiFileReloaded" gemeldet:
-->
<!--frFR:
    Lorsque "core.plugin.hotReloading" est activé, web-node vérifie avant
    chaque appel de hook si une configuration ou un fichier de hooks d'un
    plugin a changé. Les configurations modifiées sont fusionnées à nouveau
    entre "preConfigurationHotLoaded" et "postConfigurationHotLoaded", les
    fichiers de hooks modifiés sont importés à nouveau et signalés via
    "apiFileReloaded":
-->

```bash
npx web-node '{core: {plugin: {hotReloading: true}}}'
```

<!--|deDE:Eigener Einstiegspunkt-->
<!--|frFR:Point d'entrée personnalisé-->
### Own entry point

Instead of the "web-node" command you can start it from your own script and
add plugins directly in code. "isMainModule" makes sure it only starts when
the script is executed and not when it is imported:
<!--deDE:
    Statt des Befehls "web-node" können Sie es aus einem eigenen Skript
    starten und Plugins direkt im Code hinzufügen. "isMainModule" stellt
    sicher, dass es nur startet, wenn das Skript ausgeführt und nicht
    importiert wird:
-->
<!--frFR:
    Au lieu de la commande "web-node", vous pouvez le démarrer depuis votre
    propre script et ajouter des plugins directement dans le code.
    "isMainModule" garantit qu'il ne démarre que lorsque le script est
    exécuté et non importé:
-->

```JavaScript
// server.js
import {fileURLToPath} from 'node:url'
import main, {isMainModule} from 'web-node'

if (await isMainModule(fileURLToPath(import.meta.url)))
    await main({
        logger: {
            scope: {
                initialize: ({plugins}) => console.log(plugins.length)
            }
        }
    })
```

<!--|deDE:Entwicklung-->
<!--|frFR:Développement-->
Development
-----------

```bash
yarn install
yarn build
yarn test
```
