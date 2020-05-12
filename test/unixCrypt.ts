// #!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
import unixCrypt from '../unixCrypt'

describe('unixCrypt', ():void => {
    test.each([
        ['', 'ba', 'baJyGvzMWSid.'],
        ['ba', '', 'aayPdtR3JLIkk'],
        ['', '', 'aaQSqAReePlq6'],
        ['foo', 'ba', 'ba4TuD1iozTxw'],
        ['random long string', 'hi', 'hib8W/d4WOlU.'],
        ['foob', 'ar', 'arlEKn0OzVJn.'],
        ['Hello World! This is Unix crypt(3)!', 'ux', 'uxNS5oJDUz4Sc']
    ])(
        `unixCrypt('%s', '%s') === '%s'`,
        (
            password:Array<number>|string,
            salt:Array<number>|string,
            expected:Array<number>|string
        ):void =>
            expect(unixCrypt(password, salt)).toStrictEqual(expected)
    )
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
