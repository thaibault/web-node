<!-- !/usr/bin/env markdown
-*- coding: utf-8 -*-
region header
Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

License
-------

This library written by Torben Sickert stands under a creative commons naming
3.0 unported license. See https://creativecommons.org/licenses/by/3.0/deed.de
endregion -->

Project status
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
[![web documentation](https://img.shields.io/website-up-down-green-red/https/torben.website/web-node.svg?label=web-documentation&style=for-the-badge)](https://torben.website/web-node)

[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=for-the-badge&logo=codesandbox)](https://githubbox.com/thaibault/web-node)

Use case
--------

WebNode is a high-level JavaScript backend plugin system and configuration
merger.

<div class="wd-table-of-contents">
    <h2 id="content">Content<!--deDE:Inhalt--><!--frFR:Contenu--></h2>
    <!--wd-table-of-contents-->
</div>

Installation
------------

You can install via package manager, simply download the compiled version as
zip file here and inject or request via CDN in HTML:
<!--deDE:
    Sie können das Paket über den Paketmanager installieren oder einfach die
    kompilierte Version als ZIP-Datei hier herunterladen und in HTML einbinden
    oder über ein CDN abrufen:
-->
<!--frFR:
    Vous pouvez installer le paquet via le gestionnaire de paquets ou
    simplement télécharger ici la version compilée sous forme de fichier ZIP,
    puis l'intégrer dans une page HTML ou la récupérer via un CDN:
-->

```bash
npm install web-node
```

<!--|deDE:Verwendung-->
<!--|frFR:Demande-->
Usage
-----

You can initialize the WebNode plugin system by calling the main function in
your entry point script:

```TypeScript
// entry-module.ts

import type {PluginHandler as BasePluginHandler} from 'web-node/type'

import main, {isMainModule} from 'web-node'

export const YouWebNodeEntryPlugin: PluginHandler = {
    ...
}

if (await isMainModule(fileURLToPath(import.meta.url)))
    main()
```

Then simply calling the entry script:

```bash
ts-node ./entry-module.ts
```

When hot module reloading is needed (e.g. in development), you can use web-node
as entry point directly. That way your main entry plugin will be hot reloaded
as well.

```bash
ts-node ./node_modules/web-node/main.js
```

or

```bash
npm run web-node
```
