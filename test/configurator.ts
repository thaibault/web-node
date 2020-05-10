// #!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
describe('configurator', ():void =>
    test('main', ():void =>
        expect(typeof require('../configurator').default.debug)
            .toStrictEqual('boolean')
    )
)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
