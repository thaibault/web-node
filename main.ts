// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module web-node */
'use strict'
/* !
    region header
    [Project page](https://torben.website/webNode)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
import {fileURLToPath} from 'node:url'
/*
    NOTE: We use dynamic import here, so that we can load the module at
    runtime.
    That way we make sure that other imports of this main module share the same
    module instance.
*/
const {default: main, isMainModule} =
    await import(/* webpackIgnore: true */'./index.js')

if (await isMainModule(fileURLToPath(import.meta.url)))
    void main()
