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
import {testEach} from 'clientnode/testHelper'

import unixCrypt from '../unixCrypt'
// endregion
describe('unixCrypt', ():void => {
    testEach<typeof unixCrypt>(
        'unixCrypt',
        unixCrypt,

        ['baJyGvzMWSid.', '', 'ba'],
        ['aayPdtR3JLIkk', 'ba', ''],
        ['aaQSqAReePlq6', '', ''],
        ['ba4TuD1iozTxw', 'foo', 'ba'],
        ['hib8W/d4WOlU.', 'random long string', 'hi'],
        ['arlEKn0OzVJn.', 'foob', 'ar'],
        ['uxNS5oJDUz4Sc', 'Hello World! This is Unix crypt(3)!', 'ux']
    )
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
