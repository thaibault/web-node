// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import Tools from 'clientnode'
import path from 'path'
import * as QUnit from 'qunit-cli'
import type {PlainObject} from 'weboptimizer/type'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import type {DatabaseForbiddenError, ModelConfiguration, Models} from '../type'
import configuration from '../configurator'
import Helper from '../helper'
// endregion
QUnit.module('helper')
QUnit.load()
// region tests
QUnit.test('authenticate', (assert:Object):void => {
    for (const test:Array<any> of [
        [{}],
        [{}, null, {roles: []}],
        [{type: 'Test'}, {}, {roles: []}, {}, {Test: ['users']}, 'type'],
        [{type: 'Test'}, {}, {roles: ['users']}, {}, {Test: []}, 'type']
    ])
        assert.throws(():?true => Helper.authenticate.apply(Helper, test))
    for (const test:Array<any> of [
        [{}, null, {roles: ['_admin']}],
        [{}, {}, {roles: ['_admin']}, {}, {}, 'type'],
        [{type: 'Test'}, {}, {roles: ['users']}, {}, {Test: 'users'}, 'type'],
        [{type: 'Test'}, {}, {roles: ['users']}, {}, {Test: ['users']}, 'type']
    ])
        assert.ok(Helper.authenticate.apply(Helper, test))
})
QUnit.test('callPluginStack', (assert:Object):void => {
    for (const test:Array<any> of [
        // TODO
    ])
        assert.deepEqual(Helper.callPluginStack((test[0]), test[1]))
})
QUnit.test('determineAllowedModelRolesMapping', (assert:Object):void => {
    for (const test:Array<any> of [
        [{}, {}],
        [
            {
                specialPropertyNames: {allowedRoles: 'roles'},
                models: {Test: {}}
            },
            {}
        ],
        [
            {
                specialPropertyNames: {allowedRoles: 'roles'},
                models: {Test: {roles: []}}
            },
            {Test: []}
        ],
        [
            {
                specialPropertyNames: {allowedRoles: 'roles'},
                models: {Test: {roles: ['a']}}
            },
            {Test: ['a']}
        ]
    ])
        assert.deepEqual(
            Helper.determineAllowedModelRolesMapping(test[0]), test[1])
})
QUnit.test('ensureValidationDocumentPresence', async (
    assert:Object
):Promise<void> => {
    const done:Function = assert.async()
    for (const test:Array<any> of [
        [{put: ():Promise<void> =>
            new Promise((resolve:Function):number => setTimeout(resolve, 0))
        }, 'test', '', 'Description']
    ])
        assert.strictEqual(await Helper.ensureValidationDocumentPresence.apply(
            Helper, test))
    done()
})
QUnit.test('extendModel', (assert:Object):void => {
    for (const test:Array<any> of [
        ['A', {A: {}}, {}],
        ['A', {A: {}}, {}],
        [
            'Test',
            {_baseTest: {b: {}}, Test: {a: {}, webNodeExtends: '_baseTest'}},
            {a: {}, b: {}}
        ],
        [
            'C',
            {
                A: {a: {}},
                B: {b: {}},
                C: {c: {}, webNodeExtends: ['A', 'B']}
            },
            {a: {}, b: {}, c: {}}
        ],
        [
            'C',
            {
                A: {a: {}},
                B: {b: {}, webNodeExtends: 'A'},
                C: {c: {}, webNodeExtends: 'B'}
            },
            {a: {}, b: {}, c: {}}
        ],
        [
            'C',
            {
                _base: {d: {type: 'number'}},
                A: {a: {}},
                B: {b: {}, webNodeExtends: 'A'},
                C: {c: {}, webNodeExtends: 'B'}
            },
            {a: {}, b: {}, c: {}, d: {type: 'number'}}
        ]
    ])
        assert.deepEqual(Helper.extendModel(test[0], test[1]), test[2])
})
QUnit.test('extendModels', (assert:Object):void => {
    for (const test:Array<any> of [
        [{}, {}],
        [{models: {}}, {}],
        [{models: {Test: {}}}, {Test: {}}],
        [{models: {Test: {}}}, {Test: {}}],
        [
            {models: {Base: {b: {}}, Test: {a: {}, webNodeExtends: 'Base'}}},
            {Base: {b: {}}, Test: {a: {}, b: {}}}
        ],
        [
            {models: {_base: {b: {}}, Test: {a: {}}}},
            {Test: {a: {}, b: {}}}
        ]
    ])
        assert.deepEqual(Helper.extendModels(test[0]), test[1])
    assert.throws(():Models => Helper.extendModels({models: {a: {}}}))
    assert.deepEqual(Helper.extendModels({
        specialPropertyNames: {
            typeNameRegularExpressionPattern: /a/
        },
        models: {a: {}}
    }), {a: {}})
})
QUnit.test('validateDocumentUpdate', (assert:Object):void => {
    for (const updateStrategy:string|null of ['fillUp', 'incremental', null]) {
        const defaultModelSpecification:ModelConfiguration =
            Tools.extendObject(
                true, {}, configuration.modelConfiguration, {updateStrategy})
        for (
            const propertyName:string in defaultModelSpecification.models._base
        )
            if (
                defaultModelSpecification.models._base.hasOwnProperty(
                    propertyName
                ) && propertyName !==
                configuration.modelConfiguration.specialPropertyNames.type
            )
                delete defaultModelSpecification.models._base[propertyName]
        // region forbidden write tests
        for (const test:Array<any> of [
            // region model
            [[{}, {}], 'Type'],
            [[{webNodeType: 'test'}], 'Model'],
            // endregion
            // region property existents
            [[{webNodeType: 'Test', a: 2}], {models: {Test: {}}}, 'Property'],
            [
                [{webNodeType: 'Test', a: null}],
                {models: {Test: {a: {nullable: false}}}}, 'NotNull'
            ],
            [
                [{webNodeType: 'Test'}], {models: {Test: {a: {nullable: false}}}},
                'MissingProperty'
            ],
            // endregion
            // region property readonly
            [
                [{webNodeType: 'Test', a: 'b'}, {webNodeType: 'Test'}],
                {models: {Test: {a: {writable: false}}}}, 'Readonly'
            ],
            [
                [{webNodeType: 'Test', a: 'b'}, {webNodeType: 'Test', a: 'a'}],
                {models: {Test: {a: {writable: false}}}}, 'Readonly'
            ],
            // endregion
            // region property type
            [
                [{webNodeType: 'Test', a: 2}], {models: {Test: {a: {}}}},
                'PropertyType'
            ],
            [
                [{webNodeType: 'Test', a: 'b'}],
                {models: {Test: {a: {type: 'number'}}}}, 'PropertyType'
            ],
            [
                [{webNodeType: 'Test', a: 1}],
                {models: {Test: {a: {type: 'boolean'}}}}, 'PropertyType'
            ],
            [
                [{webNodeType: 'Test', a: 'a'}],
                {models: {Test: {a: {type: 'DateTime'}}}}, 'PropertyType'
            ],
            // / region array
            // // region type
            [
                [{webNodeType: 'Test', a: 2}],
                {models: {Test: {a: {type: 'string[]'}}}}, 'PropertyType'
            ],
            [
                [{webNodeType: 'Test', a: [2]}],
                {models: {Test: {a: {type: 'string[]'}}}}, 'PropertyType'
            ],
            [
                [{webNodeType: 'Test', a: ['b']}],
                {models: {Test: {a: {type: 'number[]'}}}}, 'PropertyType'
            ],
            [
                [{webNodeType: 'Test', a: [1]}],
                {models: {Test: {a: {type: 'boolean[]'}}}}, 'PropertyType'
            ],
            [
                [{webNodeType: 'Test', a: [1]}],
                {models: {Test: {a: {type: 'DateTime'}}}}, 'PropertyType'
            ],
            [
                [{webNodeType: 'Test', a: ['a']}],
                {models: {Test: {a: {type: 'DateTime[]'}}}}, 'PropertyType'
            ],
            // // endregion
            [
                [{webNodeType: 'Test', a: [{webNodeType: 'Test', b: 2}]}],
                {models: {Test: {a: {type: 'Test[]'}}}}, 'Property'
            ],
            [
                [
                    {
                        webNodeType: 'Test',
                        a: [{webNodeType: 'Test', b: null}],
                        b: 'a'
                    }
                ], {models: {Test: {a: {type: 'Test[]'}, b: {nullable: false}}}},
                'NotNull'
            ],
            [
                [
                    {webNodeType: 'Test', a: [{webNodeType: 'Test', b: 'a'}]},
                    {webNodeType: 'Test', a: [{webNodeType: 'Test', b: 'b'}]}
                ], {models: {Test: {a: {type: 'Test[]', writable: false}, b: {}}}},
                'Readonly'
            ],
            [
                [{webNodeType: 'Test', a: [4], b: [{
                    webNodeType: 'Test', a: [2]
                }]}],
                {models: {Test: {
                    a: {type: 'number[]', minimum: 3},
                    b: {type: 'Test[]'}
                }}}, 'Minimum'
            ],
            // / endregion
            // / region nested property
            // // region property type
            [
                [{webNodeType: 'Test', a: 1}],
                {models: {Test: {a: {type: 'Test'}}}}, 'NestedModel'
            ],
            [
                [{webNodeType: 'Test', a: null}],
                {models: {Test: {a: {type: 'Test', nullable: false}}}}, 'NotNull'
            ],
            [
                [{webNodeType: 'Test', a: {}}],
                {models: {Test: {a: {type: 'Test'}}}}, 'Type'
            ],
            [
                [{webNodeType: 'Test', a: {webNodeType: 'Test', b: 2}, b: 'a'}],
                {models: {Test: {a: {type: 'Test'}, b: {}}}}, 'PropertyType'
            ],
            // // endregion
            // // region property existents
            [
                [{webNodeType: 'Test', a: {webNodeType: 'Test', b: 2}}],
                {models: {Test: {a: {type: 'Test'}}}}, 'Property'
            ],
            [
                [{
                    webNodeType: 'Test',
                    a: {webNodeType: 'Test', b: null},
                    b: 'a'
                }], {models: {Test: {a: {type: 'Test'}, b: {nullable: false}}}},
                'NotNull'
            ],
            [
                [{
                    webNodeType: 'Test',
                    a: {webNodeType: 'Test'},
                    b: 'a'
                }],
                {models: {Test: {a: {type: 'Test'}, b: {nullable: false}}}},
                'MissingProperty'
            ],
            // // endregion
            // // region property readonly
            [
                [
                    {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'a'}},
                    {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'b'}}
                ], {models: {Test: {a: {type: 'Test'}, b: {writable: false}}}},
                'Readonly'
            ],
            [
                [
                    {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'a'}},
                    {webNodeType: 'Test', a: {webNodeType: 'Test'}}
                ], {models: {Test: {a: {type: 'Test'}, b: {writable: false}}}},
                'Readonly'
            ],
            [
                [
                    {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'a'}},
                    {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'b'}}, {}, {}
                ], {models: {Test: {a: {type: 'Test', writable: false}, b: {}}}},
                'Readonly'
            ],
            // // endregion
            // // region property range
            [
                [{webNodeType: 'Test', a: 4, b: {webNodeType: 'Test', a: 2}}],
                {models: {Test: {
                    a: {type: 'number', minimum: 3},
                    b: {type: 'Test'}
                }}}, 'Minimum'
            ],
            [
                [{
                    webNodeType: 'Test',
                    a: '1',
                    b: {webNodeType: 'Test', a: '12'}
                }], {models: {Test: {a: {maximum: 1}, b: {type: 'Test'}}}},
                'MaximalLength'
            ],
            // // endregion
            // // region property pattern
            [
                [{webNodeType: 'Test', b: {webNodeType: 'Test', a: 'b'}}],
                {models: {Test: {
                    a: {regularExpressionPattern: 'a'},
                    b: {type: 'Test'}
                }}}, 'PatternMatch'
            ],
            // // endregion
            // // region property constraint
            [
                [{
                    webNodeType: 'Test',
                    a: 'b',
                    b: {webNodeType: 'Test', a: 'a'}
                }], {models: {Test: {
                    a: {constraintEvaluation: 'newDocument.a === "b"'},
                    b: {type: 'Test'}
                }}}, 'ConstraintEvaluation'
            ],
            // // endregion
            // / endregion
            [
                [{webNodeType: 'Test', a: 1}], {models: {Test: {a: {type: 2}}}},
                'PropertyType'
            ],
            // endregion
            // region property range
            [
                [{webNodeType: 'Test', a: 2}],
                {models: {Test: {a: {type: 'number', minimum: 3}}}}, 'Minimum'
            ],
            [
                [{webNodeType: 'Test', a: 2}],
                {models: {Test: {a: {type: 'number', maximum: 1}}}}, 'Maximum'
            ],
            [
                [{webNodeType: 'Test', a: '12'}],
                {models: {Test: {a: {minimum: 3}}}}, 'MinimalLength'
            ],
            [
                [{webNodeType: 'Test', a: '12'}],
                {models: {Test: {a: {maximum: 1}}}}, 'MaximalLength'
            ],
            // endregion
            // region property pattern
            [
                [{webNodeType: 'Test', a: 'b'}],
                {models: {Test: {a: {regularExpressionPattern: 'a'}}}},
                'PatternMatch'
            ],
            // endregion
            // region property constraint
            [
                [{webNodeType: 'Test', a: 'b'}],
                {models: {Test: {a: {constraintEvaluation: 'false'}}}},
                'ConstraintEvaluation'
            ],
            [
                [{webNodeType: 'Test', a: 'b'}], {models: {Test: {a: {
                    constraintEvaluation: 'newValue === "a"'
                }}}}, 'ConstraintEvaluation'
            ]
            // endregion
        ]) {
            if (test.length < 3)
                test.splice(1, 0, {})
            const modelConfiguration:ModelConfiguration = Helper.extendModels(
                Tools.extendObject(
                    true, {}, defaultModelSpecification, test[1]))
            const options:PlainObject = Tools.extendObject(
                true, {}, defaultModelSpecification, test[1])
            delete options.defaultPropertySpecification
            delete options.models
            const parameter:Array<any> = test[0].concat([null, {}, {}].slice(
                test[0].length - 1
            )).concat([modelConfiguration, options])
            assert.throws(():Object => Helper.validateDocumentUpdate.apply(
                this, parameter
            ), (error:DatabaseForbiddenError):boolean => {
                if (error.hasOwnProperty('forbidden')) {
                    const result:boolean = error.forbidden.startsWith(
                        `${test[2]}:`)
                    if (!result)
                        console.log(
                            `Error "${error.forbidden}" doesn't start with "` +
                            `${test[2]}:". Given arguments: "` +
                            `${parameter.map(JSON.stringify).join('", "')}".`)
                    return result
                }
                // IgnoreTypeCheck
                console.log(`Unexpeced error "${error}" was thrown.`)
                return false
            })
        }
        // endregion
        // region allowed write tests
        for (const test:Array<any> of [
            [
                [{webNodeType: 'Test'}], {models: {Test: {}}}, {
                    fillUp: {webNodeType: 'Test'},
                    incremental: {webNodeType: 'Test'},
                    null: {webNodeType: 'Test'}
                }
            ],
            [
                [{webNodeType: 'Test'}], {models: {Test: {class: {}}}}, {
                    fillUp: {webNodeType: 'Test'},
                    incremental: {webNodeType: 'Test'},
                    null: {webNodeType: 'Test'}
                }
            ],
            [
                [{webNodeType: 'Test'}, {webNodeType: 'Test', a: '2'}],
                {models: {Test: {a: {}}}}, {
                    fillUp: {webNodeType: 'Test', a: '2'},
                    incremental: {},
                    null: {webNodeType: 'Test'}
                }
            ],
            [
                [{webNodeType: 'Test', a: '2'}, {webNodeType: 'Test', a: '2'}],
                {models: {Test: {a: {}}}}, {
                    fillUp: {webNodeType: 'Test', a: '2'},
                    incremental: {},
                    null: {webNodeType: 'Test', a: '2'}
                }
            ],
            [
                [{webNodeType: 'Test', a: '3'}, {webNodeType: 'Test', a: '2'}],
                {models: {Test: {a: {}}}}, {
                    fillUp: {a: '3', webNodeType: 'Test'},
                    incremental: {a: '3'},
                    null: {webNodeType: 'Test', a: '3'}
                }
            ],
            // region property existents
            [
                [{webNodeType: 'Test', a: 2}],
                {models: {Test: {a: {type: 'number'}}}}, {
                    fillUp: {webNodeType: 'Test', a: 2},
                    incremental: {webNodeType: 'Test', a: 2},
                    null: {webNodeType: 'Test', a: 2}
                }
            ],
            [
                [{webNodeType: 'Test', a: null}], {models: {Test: {a: {}}}}, {
                    fillUp: {webNodeType: 'Test'},
                    incremental: {webNodeType: 'Test'},
                    null: {webNodeType: 'Test'}
                }
            ],
            [
                [{webNodeType: 'Test', a: 'a'}],
                {models: {Test: {a: {nullable: false}}}}, {
                    fillUp: {webNodeType: 'Test', a: 'a'},
                    incremental: {webNodeType: 'Test', a: 'a'},
                    null: {webNodeType: 'Test', a: 'a'}
                }
            ],
            [
                [{webNodeType: 'Test'}, {webNodeType: 'Test', a: 'a'}],
                {models: {Test: {a: {nullable: false}}}}, {
                    fillUp: {webNodeType: 'Test', a: 'a'},
                    incremental: {},
                    null: {webNodeType: 'Test'}
                }
            ],
            // endregion
            // region property readonly
            [
                [{webNodeType: 'Test', a: 'b'}, {webNodeType: 'Test', a: 'b'}],
                {models: {Test: {a: {writable: false}}}}, {
                    fillUp: {webNodeType: 'Test', a: 'b'},
                    incremental: {},
                    null: {webNodeType: 'Test', a: 'b'}
                }
            ],
            [
                [{webNodeType: 'Test'}, {webNodeType: 'Test'}],
                {models: {Test: {a: {writable: false}}}}, {
                    fillUp: {webNodeType: 'Test'},
                    incremental: {},
                    null: {webNodeType: 'Test'}
                }
            ],
            // endregion
            // region property type
            [
                [{webNodeType: 'Test', a: '2'}, {webNodeType: 'Test', a: '2'}],
                {models: {Test: {a: {}}}}, {
                    fillUp: {webNodeType: 'Test', a: '2'},
                    incremental: {},
                    null: {webNodeType: 'Test', a: '2'}
                }
            ],
            [
                [{webNodeType: 'Test', a: 2}, {webNodeType: 'Test', a: 2}],
                {models: {Test: {a: {type: 'number'}}}}, {
                    fillUp: {webNodeType: 'Test', a: 2},
                    incremental: {},
                    null: {webNodeType: 'Test', a: 2}
                }
            ],
            [
                [
                    {webNodeType: 'Test', a: true},
                    {webNodeType: 'Test', a: true}
                ],
                {models: {Test: {a: {type: 'boolean'}}}}, {
                    fillUp: {webNodeType: 'Test', a: true},
                    incremental: {},
                    null: {webNodeType: 'Test', a: true}
                }
            ],
            [
                [{webNodeType: 'Test', a: 1}, {webNodeType: 'Test', a: 1}],
                {models: {Test: {a: {type: 'DateTime'}}}}, {
                    fillUp: {webNodeType: 'Test', a: 1},
                    incremental: {},
                    null: {webNodeType: 'Test', a: 1}
                }
            ],
            // / region array
            [
                [
                    {webNodeType: 'Test', a: ['2']},
                    {webNodeType: 'Test', a: ['2']}
                ],
                {models: {Test: {a: {type: 'string[]'}}}}, {
                    fillUp: {webNodeType: 'Test', a: ['2']},
                    incremental: {},
                    null: {webNodeType: 'Test', a: ['2']}
                }
            ],
            [
                [{webNodeType: 'Test', a: ['2']}, {webNodeType: 'Test'}],
                {models: {Test: {a: {type: 'string[]'}}}}, {
                    fillUp: {webNodeType: 'Test', a: ['2']},
                    incremental: {a: ['2']},
                    null: {webNodeType: 'Test', a: ['2']}
                }
            ],
            [
                [{webNodeType: 'Test', a: null}, {webNodeType: 'Test'}],
                {models: {Test: {a: {type: 'string[]'}}}}, {
                    fillUp: {webNodeType: 'Test'},
                    incremental: {},
                    null: {webNodeType: 'Test'}
                }
            ],
            [
                [{webNodeType: 'Test', a: [2]}, {webNodeType: 'Test'}],
                {models: {Test: {a: {type: 'number[]'}}}}, {
                    fillUp: {webNodeType: 'Test', a: [2]},
                    incremental: {a: [2]},
                    null: {webNodeType: 'Test', a: [2]}
                }
            ],
            [
                [{webNodeType: 'Test', a: [true]}, {webNodeType: 'Test'}],
                {models: {Test: {a: {type: 'boolean[]'}}}}, {
                    fillUp: {webNodeType: 'Test', a: [true]},
                    incremental: {a: [true]},
                    null: {webNodeType: 'Test', a: [true]}
                }
            ],
            [
                [{webNodeType: 'Test', a: [1]}, {webNodeType: 'Test'}],
                {models: {Test: {a: {type: 'DateTime[]'}}}}, {
                    fillUp: {webNodeType: 'Test', a: [1]},
                    incremental: {a: [1]},
                    null: {webNodeType: 'Test', a: [1]}
                }
            ],
            [
                [{webNodeType: 'Test', a: []}, {webNodeType: 'Test'}],
                {models: {Test: {a: {type: 'DateTime[]'}}}}, {
                    fillUp: {webNodeType: 'Test', a: []},
                    incremental: {a: []},
                    null: {webNodeType: 'Test', a: []}
                }
            ],
            [
                [{webNodeType: 'Test', a: [2]}, {webNodeType: 'Test'}],
                {models: {Test: {a: {type: 'DateTime[]', mutable: false}}}}, {
                    fillUp: {webNodeType: 'Test', a: [2]},
                    incremental: {a: [2]},
                    null: {webNodeType: 'Test', a: [2]}
                }
            ],
            [
                [
                    {webNodeType: 'Test', a: [2, 1]},
                    {webNodeType: 'Test', a: [2]}
                ],
                {models: {Test: {a: {type: 'number[]'}}}}, {
                    fillUp: {webNodeType: 'Test', a: [2, 1]},
                    incremental: {a: [2, 1]},
                    null: {webNodeType: 'Test', a: [2, 1]}
                }
            ],
            // / endregion
            // / region nested property
            // // region property type
            [
                [
                    {webNodeType: 'Test', a: {webNodeType: 'Test'}},
                    {webNodeType: 'Test', a: {webNodeType: 'Test'}}
                ], {models: {Test: {a: {type: 'Test'}}}}, {
                    fillUp: {webNodeType: 'Test', a: {webNodeType: 'Test'}},
                    incremental: {},
                    null: {webNodeType: 'Test', a: {webNodeType: 'Test'}}
                }
            ],
            [
                [{webNodeType: 'Test', a: null}, {webNodeType: 'Test'}],
                {models: {Test: {a: {type: 'Test'}}}}, {
                    fillUp: {webNodeType: 'Test'},
                    incremental: {},
                    null: {webNodeType: 'Test'}
                }
            ],
            [
                [
                    {webNodeType: 'Test', a: {webNodeType: 'Test', b: null}},
                    {webNodeType: 'Test', a: {webNodeType: 'Test'}}
                ], {models: {Test: {a: {type: 'Test'}, b: {}}}}, {
                    fillUp: {webNodeType: 'Test', a: {webNodeType: 'Test'}},
                    incremental: {},
                    null: {webNodeType: 'Test', a: {webNodeType: 'Test'}}
                }
            ],
            [
                [
                    {webNodeType: 'Test', a: {webNodeType: 'Test', b: '2'}},
                    {webNodeType: 'Test', a: {webNodeType: 'Test', b: '2'}}
                ], {models: {Test: {a: {type: 'Test'}, b: {}}}}, {
                    fillUp: {webNodeType: 'Test', a: {
                        webNodeType: 'Test', b: '2'
                    }},
                    incremental: {},
                    null: {webNodeType: 'Test', a: {
                        webNodeType: 'Test', b: '2'
                    }}
                }
            ],
            [
                [
                    {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test', b: 'a'},
                        b: '2'
                    },
                    {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test', b: 'a'},
                        b: '2'
                    }
                ], {models: {Test: {a: {type: 'Test'}, b: {}}}}, {
                    fillUp: {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test', b: 'a'},
                        b: '2'
                    },
                    incremental: {},
                    null: {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test', b: 'a'},
                        b: '2'
                    }
                }
            ],
            // // endregion
            // // region property existents
            [
                [
                    {webNodeType: 'Test', a: {webNodeType: 'Test'}},
                    {webNodeType: 'Test', a: {webNodeType: 'Test'}}
                ], {models: {Test: {a: {type: 'Test'}}}}, {
                    fillUp: {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test'}
                    },
                    incremental: {},
                    null: {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test'}
                    }
                }
            ],
            [
                [
                    {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test', b: null},
                        b: 'a'
                    },
                    {webNodeType: 'Test', a: {webNodeType: 'Test'}, b: 'a'}
                ], {models: {Test: {a: {type: 'Test'}, b: {}}}}, {
                    fillUp: {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test'},
                        b: 'a'
                    },
                    incremental: {},
                    null: {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test'},
                        b: 'a'
                    }
                }
            ],
            [
                [
                    {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test', b: '2'},
                        b: 'a'
                    },
                    {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test', b: '2'},
                        b: 'a'
                    }
                ], {models: {Test: {a: {type: 'Test'}, b: {nullable: false}}}},
                {
                    fillUp: {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test', b: '2'},
                        b: 'a'
                    },
                    incremental: {},
                    null: {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test', b: '2'},
                        b: 'a'
                    }
                }
            ],
            // // endregion
            // // region property readonly
            [
                [
                    {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'b'}},
                    {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'b'}}
                ], {models: {Test: {a: {type: 'Test'}, b: {writable: false}}}},
                {
                    fillUp: {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test', b: 'b'}
                    },
                    incremental: {},
                    null: {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test', b: 'b'}
                    }
                }
            ],
            [
                [
                    {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'a'}},
                    {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'a'}}
                ],
                {models: {Test: {a: {type: 'Test', writable: false}, b: {}}}}, {
                    fillUp: {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test', b: 'a'}
                    },
                    incremental: {},
                    null: {
                        webNodeType: 'Test',
                        a: {webNodeType: 'Test', b: 'a'}
                    }
                }
            ],
            // // endregion
            // // region property range
            [

                [
                    {
                        webNodeType: 'Test',
                        a: 4,
                        b: {webNodeType: 'Test', a: 3}
                    },
                    {webNodeType: 'Test'}
                ], {models: {Test: {
                    a: {type: 'number', minimum: 3},
                    b: {type: 'Test'}
                }}}, {
                    fillUp: {
                        webNodeType: 'Test',
                        a: 4,
                        b: {webNodeType: 'Test', a: 3}
                    },
                    incremental: {a: 4, b: {webNodeType: 'Test', a: 3}},
                    null: {
                        webNodeType: 'Test',
                        a: 4,
                        b: {webNodeType: 'Test', a: 3}
                    }
                }
            ],
            [
                [{
                    webNodeType: 'Test',
                    a: '1',
                    b: {webNodeType: 'Test', a: '1'}
                }], {models: {Test: {a: {maximum: 1}, b: {type: 'Test'}}}}, {
                    fillUp: {
                        webNodeType: 'Test',
                        a: '1',
                        b: {webNodeType: 'Test', a: '1'}
                    },
                    incremental: {
                        webNodeType: 'Test',
                        a: '1',
                        b: {webNodeType: 'Test', a: '1'}
                    },
                    null: {
                        webNodeType: 'Test',
                        a: '1',
                        b: {webNodeType: 'Test', a: '1'}
                    }
                }
            ],
            // // endregion
            // // region property pattern
            [
                [{webNodeType: 'Test', b: {webNodeType: 'Test', a: 'a'}}],
                {models: {Test: {
                    a: {regularExpressionPattern: 'a'},
                    b: {type: 'Test'}
                }}}, {
                    fillUp: {
                        webNodeType: 'Test', b: {webNodeType: 'Test', a: 'a'}
                    },
                    incremental: {
                        webNodeType: 'Test', b: {webNodeType: 'Test', a: 'a'}
                    },
                    null: {
                        webNodeType: 'Test', b: {webNodeType: 'Test', a: 'a'}
                    }
                }
            ],
            // // endregion
            // // region property constraint
            [
                [{
                    webNodeType: 'Test',
                    a: 'b',
                    b: {webNodeType: 'Test', a: 'b'}
                }], {models: {Test: {
                    a: {constraintEvaluation: 'newValue === "b"'},
                    b: {type: 'Test'}
                }}}, {
                    fillUp: {
                        webNodeType: 'Test',
                        a: 'b',
                        b: {webNodeType: 'Test', a: 'b'}
                    },
                    incremental: {
                        webNodeType: 'Test',
                        a: 'b',
                        b: {webNodeType: 'Test', a: 'b'}
                    },
                    null: {
                        webNodeType: 'Test',
                        a: 'b',
                        b: {webNodeType: 'Test', a: 'b'}
                    }
                }
            ],
            // // endregion
            // / endregion
            [
                [{webNodeType: 'Test', a: 2}, {webNodeType: 'Test'}],
                {models: {Test: {a: {type: 2}}}}, {
                    fillUp: {webNodeType: 'Test', a: 2},
                    incremental: {a: 2},
                    null: {webNodeType: 'Test', a: 2}
                }
            ],
            // endregion
            // region property range
            [
                [{webNodeType: 'Test', a: 3}, {webNodeType: 'Test'}],
                {models: {Test: {a: {type: 'number', minimum: 3}}}}, {
                    fillUp: {webNodeType: 'Test', a: 3},
                    incremental: {a: 3},
                    null: {webNodeType: 'Test', a: 3}
                }
            ],
            [
                [{webNodeType: 'Test', a: 1}, {webNodeType: 'Test'}],
                {models: {Test: {a: {type: 'number', maximum: 1}}}}, {
                    fillUp: {webNodeType: 'Test', a: 1},
                    incremental: {a: 1},
                    null: {webNodeType: 'Test', a: 1}
                }
            ],
            [
                [{webNodeType: 'Test', a: '123'}, {webNodeType: 'Test'}],
                {models: {Test: {a: {minimum: 3}}}}, {
                    fillUp: {webNodeType: 'Test', a: '123'},
                    incremental: {a: '123'},
                    null: {webNodeType: 'Test', a: '123'}
                }
            ],
            [
                [{webNodeType: 'Test', a: '1'}],
                {models: {Test: {a: {maximum: 1}}}}, {
                    fillUp: {webNodeType: 'Test', a: '1'},
                    incremental: {webNodeType: 'Test', a: '1'},
                    null: {webNodeType: 'Test', a: '1'}
                }
            ],
            // endregion
            // region property pattern
            [
                [{webNodeType: 'Test', a: 'a'}],
                {models: {Test: {a: {regularExpressionPattern: 'a'}}}}, {
                    fillUp: {webNodeType: 'Test', a: 'a'},
                    incremental: {webNodeType: 'Test', a: 'a'},
                    null: {webNodeType: 'Test', a: 'a'}
                }
            ],
            // endregion
            // region property constraint
            [
                [{webNodeType: 'Test', a: 'b'}],
                {models: {Test: {a: {constraintEvaluation: 'true'}}}}, {
                    fillUp: {webNodeType: 'Test', a: 'b'},
                    incremental: {webNodeType: 'Test', a: 'b'},
                    null: {webNodeType: 'Test', a: 'b'}
                }
            ],
            [
                [{webNodeType: 'Test', a: 'a'}], {models: {Test: {
                    a: {constraintEvaluation: 'newValue === "a"'}
                }}}, {
                    fillUp: {webNodeType: 'Test', a: 'a'},
                    incremental: {webNodeType: 'Test', a: 'a'},
                    null: {webNodeType: 'Test', a: 'a'}
                }
            ]
            // endregion
        ]) {
            const modelConfiguration:ModelConfiguration = Helper.extendModels(
                Tools.extendObject(
                    true, {}, defaultModelSpecification, test[1]))
            const options:PlainObject = Tools.extendObject(
                true, {}, defaultModelSpecification, test[1])
            delete options.defaultPropertySpecification
            delete options.models
            assert.deepEqual(Helper.validateDocumentUpdate.apply(
                this, test[0].concat([null, {}, {}].slice(
                    test[0].length - 1
                )).concat([modelConfiguration, options])
            ), test[2][updateStrategy])
        }
        // endregion
    }
})
QUnit.test('loadPlugin', (assert:Object):void => {
    for (const test:Array<any> of [
        // TODO
    ])
        assert.deepEqual(Helper.loadPlugin.apply(Helper, test[0]), test[1])
})
QUnit.test('loadPlugins', (assert:Object):void => {
    for (const test:Array<any> of [
        // TODO
    ])
        assert.deepEqual(Helper.loadPlugins(test[0], test[1]), test[2])
})
QUnit.test('representObject', (assert:Object):void => {
    for (const test:Array<any> of [
        [{}, '{}'],
        [5, '5'],
        [[], '[]'],
        [{a: 2, b: 3}, '{\n    "a": 2,\n    "b": 3\n}']
    ])
        assert.strictEqual(Helper.representObject(test[0]), test[1])
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
