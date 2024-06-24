// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {describe, expect, test} from '@jest/globals'
import {Configuration} from '../type'
// endregion
describe('configurator', ():void => {
    test('main', ():void =>
        expect(typeof (
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('../configurator') as {default:Configuration}
        ).default.core.debug)
            .toStrictEqual('boolean')
    )
})

// NOTE: Needed to mark this file as module (instead of global script).
export default {}
