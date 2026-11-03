// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {afterEach, beforeEach, describe, expect, test} from '@jest/globals'

import {isMainModule, isMainModulePositiveCalls} from '../index'
// endregion
// region tests
describe('index', (): void => {
    const originalArguments: Array<string> = process.argv

    beforeEach((): void => {
        isMainModulePositiveCalls.value = 0
    })
    afterEach((): void => {
        process.argv = originalArguments
        isMainModulePositiveCalls.value = 0
    })

    test('isMainModule', async (): Promise<void> => {
        expect(await isMainModule(process.argv[1], false)).toStrictEqual(true)
        expect(await isMainModule(__filename, false)).toStrictEqual(false)
        // Not existing files are no main modules.
        expect(await isMainModule('/not/existing/file.js', false))
            .toStrictEqual(false)
        expect(isMainModulePositiveCalls.value).toStrictEqual(1)
    })
    test('isMainModule only once', async (): Promise<void> => {
        expect(await isMainModule(process.argv[1])).toStrictEqual(true)
        expect(await isMainModule(process.argv[1])).toStrictEqual(false)
        expect(await isMainModule(process.argv[1], false)).toStrictEqual(true)
    })
    test('isMainModule without script argument', async (): Promise<void> => {
        process.argv = [originalArguments[0]]

        expect(await isMainModule(originalArguments[1], false))
            .toStrictEqual(false)
    })
})
// endregion
