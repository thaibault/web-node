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
QUnit.test('callPluginStack', async (assert:Object):void => {
    const done:Function = assert.async()
    for (const test:Array<any> of [
        [['test', []], null],
        [['test', [], null], null],
        [['test', [], {}], {}]
        // TODO add more tests
    ])
        assert.deepEqual(
            await Helper.callPluginStack.apply(Helper, test[0]), test[1])
    done()
})
QUnit.test('checkRechability', async (assert:Object):void => {
    const done:Function = assert.async()
    for (const test:Array<any> of [
        ['http://unknownHostName'],
        ['http://unknownHostName', false, 301],
        ['http://unknownHostName', true, 200, 0.01, 0.025]
    ])
        try {
            await Helper.checkReachability.apply(Helper, test)
            assert.ok(false)
        } catch (error) {
            assert.ok(true)
        }
    done()
})
QUnit.test('determineAllowedModelRolesMapping', (assert:Object):void => {
    for (const test:Array<any> of [
        [{}, {}],
        [
            {
                specialPropertyNames: {allowedRoles: 'roles'},
                models: {Test: {}}
            }, {}
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
            {_baseTest: {b: {}}, Test: {a: {}, _extends: '_baseTest'}},
            {a: {}, b: {}}
        ],
        [
            'C',
            {A: {a: {}}, B: {b: {}}, C: {c: {}, _extends: ['A', 'B']}},
            {a: {}, b: {}, c: {}}
        ],
        [
            'C',
            {A: {a: {}}, B: {b: {}, _extends: 'A'}, C: {c: {}, _extends: 'B'}},
            {a: {}, b: {}, c: {}}
        ],
        [
            'C',
            {
                _base: {d: {type: 'number'}},
                A: {a: {}},
                B: {b: {}, _extends: 'A'},
                C: {c: {}, _extends: 'B'}
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
            {models: {Base: {b: {}}, Test: {a: {}, _extends: 'Base'}}},
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
            // region general environment
            [[{_type: 'Test', _rev: 'latest'}, null], 'Revision'],
            [[{_type: 'Test', _rev: 'latest'}, {}], 'Revision'],
            [[{_type: 'Test', _rev: 'latest'}, {_type: 'Test'}], 'Revision'],
            // endregion
            // region model
            [[{}, {}], 'Type'],
            [[{_type: 'test'}], 'Model'],
            // endregion
            // region hooks
            // / region on create
            [[{_type: 'Test', a: ''}], {models: {Test: {a: {
                onCreateEvaluation: '+'
            }}}}, 'Compilation'],
            [[{_type: 'Test', a: ''}], {models: {Test: {a: {
                onCreateExpression: 'return +'
            }}}}, 'Compilation'],
            [[{_type: 'Test', a: ''}], {models: {Test: {a: {
                onCreateEvaluation: 'undefinedVariableName'
            }}}}, 'Runtime'],
            [[{_type: 'Test', a: ''}], {models: {Test: {a: {
                onCreateExpression: 'return undefinedVariableName'
            }}}}, 'Runtime'],
            // / endregion
            // / region on update
            [[{_type: 'Test', a: ''}], {models: {Test: {a: {
                onUpdateEvaluation: '+'
            }}}}, 'Compilation'],
            [[{_type: 'Test', a: ''}], {models: {Test: {a: {
                onUpdateExpression: 'return +'
            }}}}, 'Compilation'],
            [[{_type: 'Test', a: ''}], {models: {Test: {a: {
                onUpdateEvaluation: 'undefinedVariableName'
            }}}}, 'Runtime'],
            [[{_type: 'Test', a: ''}], {models: {Test: {a: {
                onUpdateExpression: 'return undefinedVariableName'
            }}}}, 'Runtime'],
            // / endregion
            // endregion
            // region property writable/mutable
            [
                [{_type: 'Test', a: 'b'}, {_type: 'Test'}],
                {models: {Test: {a: {writable: false}}}}, 'Readonly'
            ],
            [
                [{_type: 'Test', a: 'b'}, {_type: 'Test', a: 'a'}],
                {models: {Test: {a: {writable: false}}}}, 'Readonly'
            ],
            // endregion
            // region property existents
            [[{_type: 'Test', a: 2}], {models: {Test: {}}}, 'Property'],
            [
                [{_type: 'Test', a: null}],
                {models: {Test: {a: {nullable: false}}}}, 'NotNull'
            ],
            [
                [{_type: 'Test'}], {models: {Test: {a: {nullable: false}}}},
                'MissingProperty'
            ],
            // endregion
            // region property type
            [
                [{_type: 'Test', a: 2}], {models: {Test: {a: {}}}},
                'PropertyType'
            ],
            [
                [{_type: 'Test', a: 'b'}],
                {models: {Test: {a: {type: 'number'}}}}, 'PropertyType'
            ],
            [
                [{_type: 'Test', a: 1}],
                {models: {Test: {a: {type: 'boolean'}}}}, 'PropertyType'
            ],
            [
                [{_type: 'Test', a: 'a'}],
                {models: {Test: {a: {type: 'DateTime'}}}}, 'PropertyType'
            ],
            // / region array
            // // region type
            [
                [{_type: 'Test', a: 2}],
                {models: {Test: {a: {type: 'string[]'}}}}, 'PropertyType'
            ],
            [
                [{_type: 'Test', a: [2]}],
                {models: {Test: {a: {type: 'string[]'}}}}, 'PropertyType'
            ],
            [
                [{_type: 'Test', a: ['b']}],
                {models: {Test: {a: {type: 'number[]'}}}}, 'PropertyType'
            ],
            [
                [{_type: 'Test', a: [1]}],
                {models: {Test: {a: {type: 'boolean[]'}}}}, 'PropertyType'
            ],
            [
                [{_type: 'Test', a: [1]}],
                {models: {Test: {a: {type: 'DateTime'}}}}, 'PropertyType'
            ],
            [
                [{_type: 'Test', a: ['a']}],
                {models: {Test: {a: {type: 'DateTime[]'}}}}, 'PropertyType'
            ],
            // // endregion
            [
                [{_type: 'Test', a: [{_type: 'Test', b: 2}]}],
                {models: {Test: {a: {type: 'Test[]'}}}}, 'Property'
            ],
            [
                [{_type: 'Test', a: [{_type: 'Test', b: null}], b: 'a'}],
                {models: {Test: {a: {type: 'Test[]'}, b: {nullable: false}}}},
                'NotNull'
            ],
            [
                [
                    {_type: 'Test', a: [{_type: 'Test', b: 'a'}]},
                    {_type: 'Test', a: [{_type: 'Test', b: 'b'}]}
                ], {models: {
                    Test: {a: {type: 'Test[]', writable: false},
                    b: {}}
                }}, 'Readonly'
            ],
            [
                [{_type: 'Test', a: [4], b: [{_type: 'Test', a: [2]}]}],
                {models: {Test: {
                    a: {type: 'number[]', minimum: 3},
                    b: {type: 'Test[]'}
                }}}, 'Minimum'
            ],
            // / endregion
            // / region nested property
            // // region property type
            [
                [{_type: 'Test', a: 1}],
                {models: {Test: {a: {type: 'Test'}}}}, 'NestedModel'
            ],
            [
                [{_type: 'Test', a: null}],
                {models: {Test: {a: {type: 'Test', nullable: false}}}},
                'NotNull'
            ],
            [
                [{_type: 'Test', a: {}}],
                {models: {Test: {a: {type: 'Test'}}}}, 'Type'
            ],
            [
                [{_type: 'Test', a: {_type: 'Test', b: 2}, b: 'a'}],
                {models: {Test: {a: {type: 'Test'}, b: {}}}}, 'PropertyType'
            ],
            // // endregion
            // // region property existents
            [
                [{_type: 'Test', a: {_type: 'Test', b: 2}}],
                {models: {Test: {a: {type: 'Test'}}}}, 'Property'
            ],
            [
                [{_type: 'Test', a: {_type: 'Test', b: null}, b: 'a'}],
                {models: {Test: {a: {type: 'Test'}, b: {nullable: false}}}},
                'NotNull'
            ],
            [
                [{_type: 'Test', a: {_type: 'Test'}, b: 'a'}],
                {models: {Test: {a: {type: 'Test'}, b: {nullable: false}}}},
                'MissingProperty'
            ],
            // // endregion
            // // region property readonly
            [
                [
                    {_type: 'Test', a: {_type: 'Test', b: 'a'}},
                    {_type: 'Test', a: {_type: 'Test', b: 'b'}}
                ], {models: {Test: {a: {type: 'Test'}, b: {writable: false}}}},
                'Readonly'
            ],
            [
                [
                    {_type: 'Test', a: {_type: 'Test', b: 'a'}},
                    {_type: 'Test', a: {_type: 'Test', b: 'b'}}
                ], {models: {Test: {a: {type: 'Test'}, b: {mutable: false}}}},
                'Immutable'
            ],
            [
                [
                    {_type: 'Test', a: {_type: 'Test', b: 'a'}},
                    {_type: 'Test', a: {_type: 'Test'}}
                ], {models: {Test: {a: {type: 'Test'}, b: {writable: false}}}},
                'Readonly'
            ],
            [
                [
                    {_type: 'Test', a: {_type: 'Test', b: 'a'}},
                    {_type: 'Test', a: {_type: 'Test', b: 'b'}}, {}, {}
                ],
                {models: {Test: {a: {type: 'Test', writable: false}, b: {}}}},
                'Readonly'
            ],
            // // endregion
            // // region property range
            [
                [{_type: 'Test', a: 4, b: {_type: 'Test', a: 2}}],
                {models: {Test: {
                    a: {type: 'number', minimum: 3}, b: {type: 'Test'}
                }}}, 'Minimum'
            ],
            [
                [{_type: 'Test', a: '1', b: {_type: 'Test', a: '12'}}],
                {models: {Test: {a: {maximum: 1}, b: {type: 'Test'}}}},
                'MaximalLength'
            ],
            // // endregion
            // // region property pattern
            [
                [{_type: 'Test', b: {_type: 'Test', a: 'b'}}],
                {models: {Test: {
                    a: {regularExpressionPattern: 'a'},
                    b: {type: 'Test'}
                }}}, 'PatternMatch'
            ],
            // // endregion
            // // region property constraint
            [
                [{_type: 'Test', a: 'b', b: {_type: 'Test', a: 'a'}}],
                {models: {Test: {
                    a: {constraintEvaluation: 'newValue === "b"'},
                    b: {type: 'Test'}
                }}}, 'ConstraintEvaluation'
            ],
            // // endregion
            // / endregion
            [
                [{_type: 'Test', a: 1}], {models: {Test: {a: {type: 2}}}},
                'PropertyType'
            ],
            // endregion
            // region property range
            [
                [{_type: 'Test', a: 2}],
                {models: {Test: {a: {type: 'number', minimum: 3}}}}, 'Minimum'
            ],
            [
                [{_type: 'Test', a: 2}],
                {models: {Test: {a: {type: 'number', maximum: 1}}}}, 'Maximum'
            ],
            [
                [{_type: 'Test', a: '12'}],
                {models: {Test: {a: {minimum: 3}}}}, 'MinimalLength'
            ],
            [
                [{_type: 'Test', a: '12'}],
                {models: {Test: {a: {maximum: 1}}}}, 'MaximalLength'
            ],
            // endregion
            // region property pattern
            [
                [{_type: 'Test', a: 'b'}],
                {models: {Test: {a: {regularExpressionPattern: 'a'}}}},
                'PatternMatch'
            ],
            // endregion
            // region property constraint
            [
                [{_type: 'Test', a: 'b'}],
                {models: {Test: {a: {constraintEvaluation: 'false'}}}},
                'ConstraintEvaluation'
            ],
            [
                [{_type: 'Test', a: 'b'}],
                {models: {Test: {a: {constraintExpression: 'false'}}}},
                'ConstraintExpression'
            ],
            [
                [{_type: 'Test', a: 'b'}],
                {models: {Test: {a: {constraintEvaluation: '+'}}}},
                'Compilation'
            ],
            [
                [{_type: 'Test', a: 'b'}], {models: {Test: {a: {
                    constraintEvaluation: 'undefinedVariableName'
                }}}}, 'Runtime'
            ],
            [
                [{_type: 'Test', a: 'b'}], {models: {Test: {a: {
                    constraintExpression: 'return undefinedVariableName'
                }}}}, 'Runtime'
            ],
            [[{_type: 'Test', a: 'b'}], {models: {Test: {a: {
                constraintEvaluation: 'newValue === "a"'
            }}}}, 'ConstraintEvaluation']
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
            // region general environment
            [[{_deleted: true}], {}, {
                fillUp: {_deleted: true},
                incremental: {_deleted: true},
                null: {_deleted: true}
            }],
            [[{_id: 1, _rev: 1}, null, {}, {_validatedDocuments: new Set(
                ['1-1']
            )}], {}, {
                fillUp: {_id: 1, _rev: 1},
                incremental: {_id: 1, _rev: 1},
                null: {_id: 1, _rev: 1}
            }],
            [[{_type: 'Test', _rev: 'latest'}, {_type: 'Test', _rev: 1}], {
                models: {Test: {}}
            }, {
                fillUp: {_type: 'Test', _rev: 1},
                incremental: {},
                null: {_type: 'Test', _rev: 1}
            }],
            // endregion
            // region model
            [[{_type: 'Test'}], {models: {Test: {}}}, {
                fillUp: {_type: 'Test'},
                incremental: {_type: 'Test'},
                null: {_type: 'Test'}
            }],
            [[{_type: 'Test'}], {models: {Test: {}}}, {
                fillUp: {_type: 'Test'},
                incremental: {_type: 'Test'},
                null: {_type: 'Test'}
            }],
            [[{_type: 'Test'}], {models: {Test: {class: {}}}}, {
                fillUp: {_type: 'Test'},
                incremental: {_type: 'Test'},
                null: {_type: 'Test'}
            }],
            [[{_type: 'Test'}, {_type: 'Test', a: '2'}], {
                models: {Test: {a: {}}}
            }, {
                fillUp: {_type: 'Test', a: '2'},
                incremental: {},
                null: {_type: 'Test'}
            }],
            [[{_type: 'Test', a: '2'}, {_type: 'Test', a: '2'}], {
                models: {Test: {a: {}}}
            }, {
                fillUp: {_type: 'Test', a: '2'},
                incremental: {},
                null: {_type: 'Test', a: '2'}
            }],
            [[{_type: 'Test', a: '3'}, {_type: 'Test', a: '2'}], {
                models: {Test: {a: {}}}}, {
                    fillUp: {a: '3', _type: 'Test'},
                    incremental: {a: '3'},
                    null: {_type: 'Test', a: '3'}
                }
            ],
            // endregion
            // region hooks
            // / region on create
            [[{_type: 'Test', a: ''}], {models: {Test: {a: {
                onCreateEvaluation: "'2'"
            }}}}, {
                fillUp: {_type: 'Test', a: '2'},
                incremental: {_type: 'Test', a: '2'},
                null: {_type: 'Test', a: '2'}
            }],
            [[{_type: 'Test', a: ''}], {models: {Test: {a: {
                onCreateExpression: "return '2'"
            }}}}, {
                fillUp: {_type: 'Test', a: '2'},
                incremental: {_type: 'Test', a: '2'},
                null: {_type: 'Test', a: '2'}
            }],
            [[{_type: 'Test', a: ''}, {_type: 'Test', a: ''}], {models: {
                Test: {a: {onCreateExpression: "return '2'"}}
            }}, {
                fillUp: {_type: 'Test', a: ''},
                incremental: {},
                null: {_type: 'Test', a: ''}
            }],
            // / endregion
            // / region on update
            [[{_type: 'Test', a: ''}], {models: {Test: {a: {
                onUpdateEvaluation: "'2'"
            }}}}, {
                fillUp: {_type: 'Test', a: '2'},
                incremental: {_type: 'Test', a: '2'},
                null: {_type: 'Test', a: '2'}
            }],
            [[{_type: 'Test', a: ''}], {models: {Test: {a: {
                onUpdateExpression: "return '2'"
            }}}}, {
                fillUp: {_type: 'Test', a: '2'},
                incremental: {_type: 'Test', a: '2'},
                null: {_type: 'Test', a: '2'}
            }],
            [[{_type: 'Test', a: '1'}, {_type: 'Test', a: '2'}], {models: {
                Test: {a: {onUpdateEvaluation: "'2'"
            }}}}, {
                fillUp: {_type: 'Test', a: '2'},
                incremental: {},
                null: {_type: 'Test', a: '2'}
            }],
            // / endregion
            // endregion
            // region property writable/mutable
            [[{_type: 'Test', a: 'b'}, {_type: 'Test', a: 'b'}], {models: {
                Test: {a: {writable: false}}
            }}, {
                fillUp: {_type: 'Test', a: 'b'},
                incremental: {},
                null: {_type: 'Test', a: 'b'}
            }],
            [[{_type: 'Test'}, {_type: 'Test'}], {models: {Test: {a: {
                writable: false
            }}}}, {
                fillUp: {_type: 'Test'},
                incremental: {},
                null: {_type: 'Test'}
            }],
            [[{_type: 'Test', a: '2'}, {_type: 'Test'}], {models: {Test: {a: {
                mutable: false
            }}}}, {
                fillUp: {_type: 'Test', a: '2'},
                incremental: {a: '2'},
                null: {_type: 'Test', a: '2'}
            }],
            // endregion
            // region property existents
            [[{_type: 'Test', a: 2}], {models: {Test: {a: {
                type: 'number'
            }}}}, {
                fillUp: {_type: 'Test', a: 2},
                incremental: {_type: 'Test', a: 2},
                null: {_type: 'Test', a: 2}
            }],
            [[{_type: 'Test', a: null}], {models: {Test: {a: {}}}}, {
                fillUp: {_type: 'Test'},
                incremental: {_type: 'Test'},
                null: {_type: 'Test'}
            }],
            [[{_type: 'Test', a: 'a'}], {models: {Test: {a: {
                nullable: false
            }}}}, {
                fillUp: {_type: 'Test', a: 'a'},
                incremental: {_type: 'Test', a: 'a'},
                null: {_type: 'Test', a: 'a'}
            }],
            [[{_type: 'Test'}, {_type: 'Test', a: 'a'}], {models: {Test: {a: {
                nullable: false
            }}}}, {
                fillUp: {_type: 'Test', a: 'a'},
                incremental: {},
                null: {_type: 'Test'}
            }],
            [[{_type: 'Test'}], {models: {Test: {a: {
                default: '2',
                nullable: false
            }}}}, {
                fillUp: {_type: 'Test', a: '2'},
                incremental: {_type: 'Test', a: '2'},
                null: {_type: 'Test', a: '2'}
            }],
            // endregion
            // region property type
            [
                [{_type: 'Test', a: '2'}, {_type: 'Test', a: '2'}],
                {models: {Test: {a: {}}}}, {
                    fillUp: {_type: 'Test', a: '2'},
                    incremental: {},
                    null: {_type: 'Test', a: '2'}
                }
            ],
            [
                [{_type: 'Test', a: 2}, {_type: 'Test', a: 2}],
                {models: {Test: {a: {type: 'number'}}}}, {
                    fillUp: {_type: 'Test', a: 2},
                    incremental: {},
                    null: {_type: 'Test', a: 2}
                }
            ],
            [
                [
                    {_type: 'Test', a: true},
                    {_type: 'Test', a: true}
                ],
                {models: {Test: {a: {type: 'boolean'}}}}, {
                    fillUp: {_type: 'Test', a: true},
                    incremental: {},
                    null: {_type: 'Test', a: true}
                }
            ],
            [
                [{_type: 'Test', a: 1}, {_type: 'Test', a: 1}],
                {models: {Test: {a: {type: 'DateTime'}}}}, {
                    fillUp: {_type: 'Test', a: 1},
                    incremental: {},
                    null: {_type: 'Test', a: 1}
                }
            ],
            // / region array
            [
                [
                    {_type: 'Test', a: ['2']},
                    {_type: 'Test', a: ['2']}
                ],
                {models: {Test: {a: {type: 'string[]'}}}}, {
                    fillUp: {_type: 'Test', a: ['2']},
                    incremental: {},
                    null: {_type: 'Test', a: ['2']}
                }
            ],
            [
                [{_type: 'Test', a: ['2']}, {_type: 'Test'}],
                {models: {Test: {a: {type: 'string[]'}}}}, {
                    fillUp: {_type: 'Test', a: ['2']},
                    incremental: {a: ['2']},
                    null: {_type: 'Test', a: ['2']}
                }
            ],
            [
                [{_type: 'Test', a: null}, {_type: 'Test'}],
                {models: {Test: {a: {type: 'string[]'}}}}, {
                    fillUp: {_type: 'Test'},
                    incremental: {},
                    null: {_type: 'Test'}
                }
            ],
            [
                [{_type: 'Test', a: [2]}, {_type: 'Test'}],
                {models: {Test: {a: {type: 'number[]'}}}}, {
                    fillUp: {_type: 'Test', a: [2]},
                    incremental: {a: [2]},
                    null: {_type: 'Test', a: [2]}
                }
            ],
            [
                [{_type: 'Test', a: [true]}, {_type: 'Test'}],
                {models: {Test: {a: {type: 'boolean[]'}}}}, {
                    fillUp: {_type: 'Test', a: [true]},
                    incremental: {a: [true]},
                    null: {_type: 'Test', a: [true]}
                }
            ],
            [
                [{_type: 'Test', a: [1]}, {_type: 'Test'}],
                {models: {Test: {a: {type: 'DateTime[]'}}}}, {
                    fillUp: {_type: 'Test', a: [1]},
                    incremental: {a: [1]},
                    null: {_type: 'Test', a: [1]}
                }
            ],
            [
                [{_type: 'Test', a: []}, {_type: 'Test'}],
                {models: {Test: {a: {type: 'DateTime[]'}}}}, {
                    fillUp: {_type: 'Test', a: []},
                    incremental: {a: []},
                    null: {_type: 'Test', a: []}
                }
            ],
            [
                [{_type: 'Test', a: [2]}, {_type: 'Test'}],
                {models: {Test: {a: {type: 'DateTime[]', mutable: false}}}}, {
                    fillUp: {_type: 'Test', a: [2]},
                    incremental: {a: [2]},
                    null: {_type: 'Test', a: [2]}
                }
            ],
            [
                [
                    {_type: 'Test', a: [2, 1]},
                    {_type: 'Test', a: [2]}
                ],
                {models: {Test: {a: {type: 'number[]'}}}}, {
                    fillUp: {_type: 'Test', a: [2, 1]},
                    incremental: {a: [2, 1]},
                    null: {_type: 'Test', a: [2, 1]}
                }
            ],
            // / endregion
            // / region nested property
            // // region property type
            [
                [
                    {_type: 'Test', a: {_type: 'Test'}},
                    {_type: 'Test', a: {_type: 'Test'}}
                ], {models: {Test: {a: {type: 'Test'}}}}, {
                    fillUp: {_type: 'Test', a: {_type: 'Test'}},
                    incremental: {},
                    null: {_type: 'Test', a: {_type: 'Test'}}
                }
            ],
            [
                [{_type: 'Test', a: null}, {_type: 'Test'}],
                {models: {Test: {a: {type: 'Test'}}}}, {
                    fillUp: {_type: 'Test'},
                    incremental: {},
                    null: {_type: 'Test'}
                }
            ],
            [
                [
                    {_type: 'Test', a: {_type: 'Test', b: null}},
                    {_type: 'Test', a: {_type: 'Test'}}
                ], {models: {Test: {a: {type: 'Test'}, b: {}}}}, {
                    fillUp: {_type: 'Test', a: {_type: 'Test'}},
                    incremental: {},
                    null: {_type: 'Test', a: {_type: 'Test'}}
                }
            ],
            [
                [
                    {_type: 'Test', a: {_type: 'Test', b: '2'}},
                    {_type: 'Test', a: {_type: 'Test', b: '2'}}
                ], {models: {Test: {a: {type: 'Test'}, b: {}}}}, {
                    fillUp: {_type: 'Test', a: {
                        _type: 'Test', b: '2'
                    }},
                    incremental: {},
                    null: {_type: 'Test', a: {
                        _type: 'Test', b: '2'
                    }}
                }
            ],
            [
                [
                    {
                        _type: 'Test',
                        a: {_type: 'Test', b: 'a'},
                        b: '2'
                    },
                    {
                        _type: 'Test',
                        a: {_type: 'Test', b: 'a'},
                        b: '2'
                    }
                ], {models: {Test: {a: {type: 'Test'}, b: {}}}}, {
                    fillUp: {
                        _type: 'Test',
                        a: {_type: 'Test', b: 'a'},
                        b: '2'
                    },
                    incremental: {},
                    null: {
                        _type: 'Test',
                        a: {_type: 'Test', b: 'a'},
                        b: '2'
                    }
                }
            ],
            // // endregion
            // // region property existents
            [
                [
                    {_type: 'Test', a: {_type: 'Test'}},
                    {_type: 'Test', a: {_type: 'Test'}}
                ], {models: {Test: {a: {type: 'Test'}}}}, {
                    fillUp: {
                        _type: 'Test',
                        a: {_type: 'Test'}
                    },
                    incremental: {},
                    null: {
                        _type: 'Test',
                        a: {_type: 'Test'}
                    }
                }
            ],
            [
                [
                    {
                        _type: 'Test',
                        a: {_type: 'Test', b: null},
                        b: 'a'
                    },
                    {_type: 'Test', a: {_type: 'Test'}, b: 'a'}
                ], {models: {Test: {a: {type: 'Test'}, b: {}}}}, {
                    fillUp: {
                        _type: 'Test',
                        a: {_type: 'Test'},
                        b: 'a'
                    },
                    incremental: {},
                    null: {
                        _type: 'Test',
                        a: {_type: 'Test'},
                        b: 'a'
                    }
                }
            ],
            [
                [
                    {
                        _type: 'Test',
                        a: {_type: 'Test', b: '2'},
                        b: 'a'
                    },
                    {
                        _type: 'Test',
                        a: {_type: 'Test', b: '2'},
                        b: 'a'
                    }
                ], {models: {Test: {a: {type: 'Test'}, b: {nullable: false}}}},
                {
                    fillUp: {
                        _type: 'Test',
                        a: {_type: 'Test', b: '2'},
                        b: 'a'
                    },
                    incremental: {},
                    null: {
                        _type: 'Test',
                        a: {_type: 'Test', b: '2'},
                        b: 'a'
                    }
                }
            ],
            // // endregion
            // // region property readonly
            [
                [
                    {_type: 'Test', a: {_type: 'Test', b: 'b'}},
                    {_type: 'Test', a: {_type: 'Test', b: 'b'}}
                ], {models: {Test: {a: {type: 'Test'}, b: {writable: false}}}},
                {
                    fillUp: {
                        _type: 'Test',
                        a: {_type: 'Test', b: 'b'}
                    },
                    incremental: {},
                    null: {
                        _type: 'Test',
                        a: {_type: 'Test', b: 'b'}
                    }
                }
            ],
            [
                [
                    {_type: 'Test', a: {_type: 'Test', b: 'a'}},
                    {_type: 'Test', a: {_type: 'Test', b: 'a'}}
                ],
                {models: {Test: {a: {type: 'Test', writable: false}, b: {}}}},
                {
                    fillUp: {_type: 'Test', a: {_type: 'Test', b: 'a'}},
                    incremental: {},
                    null: {_type: 'Test', a: {_type: 'Test', b: 'a'}}
                }
            ],
            // // endregion
            // // region property range
            [

                [
                    {_type: 'Test', a: 4, b: {_type: 'Test', a: 3}},
                    {_type: 'Test'}
                ], {models: {Test: {
                    a: {type: 'number', minimum: 3},
                    b: {type: 'Test'}
                }}}, {
                    fillUp: {_type: 'Test', a: 4, b: {_type: 'Test', a: 3}},
                    incremental: {a: 4, b: {_type: 'Test', a: 3}},
                    null: {_type: 'Test', a: 4, b: {_type: 'Test', a: 3}}
                }
            ],
            [
                [{_type: 'Test', a: '1', b: {_type: 'Test', a: '1'}}],
                {models: {Test: {a: {maximum: 1}, b: {type: 'Test'}}}}, {
                    fillUp: {
                        _type: 'Test',
                        a: '1',
                        b: {_type: 'Test', a: '1'}
                    },
                    incremental: {
                        _type: 'Test',
                        a: '1',
                        b: {_type: 'Test', a: '1'}
                    },
                    null: {
                        _type: 'Test',
                        a: '1',
                        b: {_type: 'Test', a: '1'}
                    }
                }
            ],
            // // endregion
            // // region property pattern
            [
                [{_type: 'Test', b: {_type: 'Test', a: 'a'}}],
                {models: {Test: {
                    a: {regularExpressionPattern: 'a'},
                    b: {type: 'Test'}
                }}}, {
                    fillUp: {_type: 'Test', b: {_type: 'Test', a: 'a'}},
                    incremental: {_type: 'Test', b: {_type: 'Test', a: 'a'}},
                    null: {_type: 'Test', b: {_type: 'Test', a: 'a'}}
                }
            ],
            // // endregion
            // // region property constraint
            [[{_type: 'Test', a: 'b', b: {_type: 'Test', a: 'b'}}], {
                models: {Test: {
                    a: {constraintEvaluation: 'newValue === "b"'},
                    b: {type: 'Test'}
                }
            }}, {
                fillUp: {_type: 'Test', a: 'b', b: {_type: 'Test', a: 'b'}},
                incremental: {
                    _type: 'Test',
                    a: 'b',
                    b: {_type: 'Test', a: 'b'}
                },
                null: {
                    _type: 'Test',
                    a: 'b',
                    b: {_type: 'Test', a: 'b'}
                }
            }
            ],
            // // endregion
            // / endregion
            [[{_type: 'Test', a: 2}, {_type: 'Test'}], {
                models: {Test: {a: {type: 2}}}}, {
                    fillUp: {_type: 'Test', a: 2},
                    incremental: {a: 2},
                    null: {_type: 'Test', a: 2}
                }
            ],
            // endregion
            // region property range
            [[{_type: 'Test', a: 3}, {_type: 'Test'}], {
                models: {Test: {a: {type: 'number', minimum: 3}}}}, {
                    fillUp: {_type: 'Test', a: 3},
                    incremental: {a: 3},
                    null: {_type: 'Test', a: 3}
                }
            ],
            [[{_type: 'Test', a: 1}, {_type: 'Test'}], {
                models: {Test: {a: {type: 'number', maximum: 1}}}}, {
                    fillUp: {_type: 'Test', a: 1},
                    incremental: {a: 1},
                    null: {_type: 'Test', a: 1}
                }
            ],
            [[{_type: 'Test', a: '123'}, {_type: 'Test'}], {
                models: {Test: {a: {minimum: 3}}}}, {
                    fillUp: {_type: 'Test', a: '123'},
                    incremental: {a: '123'},
                    null: {_type: 'Test', a: '123'}
                }
            ],
            [[{_type: 'Test', a: '1'}], {
                models: {Test: {a: {maximum: 1}}}}, {
                    fillUp: {_type: 'Test', a: '1'},
                    incremental: {_type: 'Test', a: '1'},
                    null: {_type: 'Test', a: '1'}
                }
            ],
            // endregion
            // region property pattern
            [[{_type: 'Test', a: 'a'}], {
                models: {Test: {a: {regularExpressionPattern: 'a'}}}}, {
                    fillUp: {_type: 'Test', a: 'a'},
                    incremental: {_type: 'Test', a: 'a'},
                    null: {_type: 'Test', a: 'a'}
                }
            ],
            // endregion
            // region property constraint
            [[{_type: 'Test', a: 'b'}], {models: {Test: {a: {
                constraintEvaluation: 'true'
            }}}}, {
                fillUp: {_type: 'Test', a: 'b'},
                incremental: {_type: 'Test', a: 'b'},
                null: {_type: 'Test', a: 'b'}
            }],
            [[{_type: 'Test', a: 'a'}], {models: {Test: {a: {
                constraintEvaluation: 'newValue === "a"'
            }}}}, {
                fillUp: {_type: 'Test', a: 'a'},
                incremental: {_type: 'Test', a: 'a'},
                null: {_type: 'Test', a: 'a'}
            }],
            [[{_type: 'Test', a: 'a'}], {models: {Test: {a: {
                constraintExpression: 'return newValue === "a"'
            }}}}, {
                fillUp: {_type: 'Test', a: 'a'},
                incremental: {_type: 'Test', a: 'a'},
                null: {_type: 'Test', a: 'a'}
            }]
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
        ['dummy', {}, {}, ['webNode'], './'],
        ['dummy', {}, {a: {}}, ['a'], './'],
        ['dummy', {}, {a: {}}, ['a'], path.resolve(
            configuration.context.path,
            configuration.package.webOptimizer.path.source.base, 'test'
        )]
    ])
        assert.throws(():void => Helper.loadPlugin.apply(Helper, test))
    for (const test:Array<any> of [
        ['dummy', {}, {a: {}}, ['a'], path.resolve(
            configuration.context.path,
            configuration.package.webOptimizer.path.source.base,
            'test/dummyPlugin'
        ), {
            configuration: {},
            indexFilePath: path.resolve(
                configuration.context.path,
                configuration.package.webOptimizer.path.source.base,
                'test/dummyPlugin/index.js'),
            name: 'dummy',
            path: path.resolve(
                configuration.context.path,
                configuration.package.webOptimizer.path.source.base,
                'test/dummyPlugin'),
            scope: {}
        }]
        // TODO add more tests
    ]) {
        const plugin:Plugin = Helper.loadPlugin(
            test[0], test[1], test[2], test[3], test[4])
        delete plugin.api
        delete plugin.lastLoadTimestamp
        assert.deepEqual(plugin, test[5])
    }
})
QUnit.test('loadPlugins', (assert:Object):void => {
    for (const test:Array<any> of [
        [configuration, {}, {plugins: [], configuration}]
        // TODO add more tests
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
