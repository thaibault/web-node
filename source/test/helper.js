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
import type {DatabaseError} from '../type'
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
                types: {Test: {}}
            },
            {}
        ],
        [
            {
                specialPropertyNames: {allowedRoles: 'roles'},
                types: {Test: {roles: []}}
            },
            {Test: []}
        ],
        [
            {
                specialPropertyNames: {allowedRoles: 'roles'},
                types: {Test: {roles: ['a']}}
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
QUnit.test('extendSpecification', (assert:Object):void => {
    for (const test:Array<any> of [
        [{}, {}],
        [{types: {}}, {}],
        [{types: {Test: {}}}, {Test: {}}],
        [{types: {Test: {}}}, {Test: {}}],
        [
            {types: {Base: {b: {}}, Test: {a: {}, webNodeExtends: 'Base'}}},
            {Base: {b: {}}, Test: {a: {}, b: {}}}
        ],
        [
            {types: {_base: {b: {}}, Test: {a: {}}}},
            {Test: {a: {}, b: {}}}
        ]
    ])
        assert.deepEqual(Helper.extendSpecification(Tools.extendObject(
            {specialPropertyNames: {extend: 'webNodeExtends'}}, test[0]
        )), test[1])
    assert.throws(():{[key:string]:PlainObject} => Helper.extendSpecification({
        specialPropertyNames: {extend: 'webNodeExtends'},
        types: {a: {}}
    }))
    assert.deepEqual(Helper.extendSpecification({
        specialPropertyNames: {
            extend: 'webNodeExtends',
            typeNameRegularExpressionPattern: /a/
        },
        types: {a: {}}
    }), {a: {}})
})
QUnit.test('validateDocumentUpdate', (assert:Object):void => {
    const defaultSpecification:PlainObject = {
        defaultPropertySpecification: {
            type: 'string',
            default: null,
            onCreateEvaluation: null,
            onCreateExpression: null,
            onUpdateEvaluation: null,
            onUpdateExpression: null,
            nullable: true,
            writable: true,
            mutable: true,
            minimum: -999999999999999999999,
            maximum: 999999999999999999999,
            regularExpressionPattern: null,
            constraintEvaluation: null,
            constraintExpression: null
        },
        types: {_base: {webNodeType: {
            regularExpressionPattern: '^[A-Z][a-z0-9]+$',
            nullable: false,
            minimum: 1,
            maximum: 999,
            mutable: false
        }}},
        updateStrategy: 'incremental'
    }
    // region forbidden write tests
    for (const test:Array<any> of [
        /*
        // region model
        [[{}, {}], 'Type'],
        [[{webNodeType: 'test'}], 'Model'],
        // endregion
        // region property existents
        [[{webNodeType: 'Test', a: 2}], {types: {Test: {}}}, 'Property'],
        [
            [{webNodeType: 'Test', a: null}],
            {types: {Test: {a: {nullable: false}}}}, 'NotNull'
        ],
        [
            [{webNodeType: 'Test'}], {types: {Test: {a: {nullable: false}}}},
            'MissingProperty'
        ],
        // endregion
        // region property readonly
        [
            [{webNodeType: 'Test', a: 'b'}, {webNodeType: 'Test'}],
            {types: {Test: {a: {writable: false}}}}, 'Readonly'
        ],
        [
            [{webNodeType: 'Test', a: 'b'}, {webNodeType: 'Test', a: 'a'}],
            {types: {Test: {a: {writable: false}}}}, 'Readonly'
        ],
        // endregion
        // region property type
        [
            [{webNodeType: 'Test', a: 2}], {types: {Test: {a: {}}}},
            'PropertyType'
        ],
        [
            [{webNodeType: 'Test', a: 'b'}],
            {types: {Test: {a: {type: 'number'}}}}, 'PropertyType'
        ],
        [
            [{webNodeType: 'Test', a: 1}],
            {types: {Test: {a: {type: 'boolean'}}}}, 'PropertyType'
        ],
        [
            [{webNodeType: 'Test', a: 'a'}],
            {types: {Test: {a: {type: 'DateTime'}}}}, 'PropertyType'
        ],
        // / region array
        // // region type
        [
            [{webNodeType: 'Test', a: 2}],
            {types: {Test: {a: {type: 'string[]'}}}}, 'PropertyType'
        ],
        [
            [{webNodeType: 'Test', a: [2]}],
            {types: {Test: {a: {type: 'string[]'}}}}, 'PropertyType'
        ],
        [
            [{webNodeType: 'Test', a: ['b']}],
            {types: {Test: {a: {type: 'number[]'}}}}, 'PropertyType'
        ],
        [
            [{webNodeType: 'Test', a: [1]}],
            {types: {Test: {a: {type: 'boolean[]'}}}}, 'PropertyType'
        ],
        [
            [{webNodeType: 'Test', a: [1]}],
            {types: {Test: {a: {type: 'DateTime'}}}}, 'PropertyType'
        ],
        [
            [{webNodeType: 'Test', a: ['a']}],
            {types: {Test: {a: {type: 'DateTime[]'}}}}, 'PropertyType'
        ],
        // // endregion
        [
            [{webNodeType: 'Test', a: [{webNodeType: 'Test', b: 2}]}],
            {types: {Test: {a: {type: 'Test[]'}}}}, 'Property'
        ],
        [
            [
                {
                    webNodeType: 'Test',
                    a: [{webNodeType: 'Test', b: null}],
                    b: 'a'
                }
            ], {types: {Test: {a: {type: 'Test[]'}, b: {nullable: false}}}},
            'NotNull'
        ],
        [
            [
                {webNodeType: 'Test', a: [{webNodeType: 'Test', b: 'a'}]},
                {webNodeType: 'Test', a: [{webNodeType: 'Test', b: 'b'}]}
            ], {types: {Test: {a: {type: 'Test[]', writable: false}, b: {}}}},
            'Readonly'
        ],
        [
            [{webNodeType: 'Test', a: [4], b: [{
                webNodeType: 'Test', a: [2]
            }]}],
            {types: {Test: {
                a: {type: 'number[]', minimum: 3},
                b: {type: 'Test[]'}
            }}}, 'Minimum'
        ],
        // / endregion
        // / region nested property
        // // region property type
        [
            [{webNodeType: 'Test', a: 1}],
            {types: {Test: {a: {type: 'Test'}}}}, 'NestedModel'
        ],
        [
            [{webNodeType: 'Test', a: null}],
            {types: {Test: {a: {type: 'Test', nullable: false}}}}, 'NotNull'
        ],
        [
            [{webNodeType: 'Test', a: {}}],
            {types: {Test: {a: {type: 'Test'}}}}, 'Type'
        ],
        [
            [{webNodeType: 'Test', a: {webNodeType: 'Test', b: 2}, b: 'a'}],
            {types: {Test: {a: {type: 'Test'}, b: {}}}}, 'PropertyType'
        ],
        // // endregion
        // // region property existents
        [
            [{webNodeType: 'Test', a: {webNodeType: 'Test', b: 2}}],
            {types: {Test: {a: {type: 'Test'}}}}, 'Property'
        ],
        [
            [{
                webNodeType: 'Test',
                a: {webNodeType: 'Test', b: null},
                b: 'a'
            }], {types: {Test: {a: {type: 'Test'}, b: {nullable: false}}}},
            'NotNull'
        ],
        [
            [{
                webNodeType: 'Test',
                a: {webNodeType: 'Test'},
                b: 'a'
            }],
            {types: {Test: {a: {type: 'Test'}, b: {nullable: false}}}},
            'MissingProperty'
        ],
        // // endregion
        // // region property readonly
        [
            [
                {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'a'}},
                {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'b'}}
            ], {types: {Test: {a: {type: 'Test'}, b: {writable: false}}}},
            'Readonly'
        ],
        [
            [
                {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'a'}},
                {webNodeType: 'Test', a: {webNodeType: 'Test'}}
            ], {types: {Test: {a: {type: 'Test'}, b: {writable: false}}}},
            'Readonly'
        ],
        [
            [
                {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'a'}},
                {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'b'}}, {}, {}
            ], {types: {Test: {a: {type: 'Test', writable: false}, b: {}}}},
            'Readonly'
        ],
        // // endregion
        // // region property range
        [
            [{webNodeType: 'Test', a: 4, b: {webNodeType: 'Test', a: 2}}],
            {types: {Test: {
                a: {type: 'number', minimum: 3},
                b: {type: 'Test'}
            }}}, 'Minimum'
        ],
        [
            [{
                webNodeType: 'Test',
                a: '1',
                b: {webNodeType: 'Test', a: '12'}
            }], {types: {Test: {a: {maximum: 1}, b: {type: 'Test'}}}},
            'MaximalLength'
        ],
        // // endregion
        // // region property pattern
        [
            [{webNodeType: 'Test', b: {webNodeType: 'Test', a: 'b'}}],
            {types: {Test: {
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
            }], {types: {Test: {
                a: {constraintEvaluation: 'newDocument.a === "b"'},
                b: {type: 'Test'}
            }}}, 'ConstraintEvaluation'
        ],
        // // endregion
        // / endregion
        [
            [{webNodeType: 'Test', a: 1}], {types: {Test: {a: {type: 2}}}},
            'PropertyType'
        ],
        // endregion
        // region property range
        [
            [{webNodeType: 'Test', a: 2}],
            {types: {Test: {a: {type: 'number', minimum: 3}}}}, 'Minimum'
        ],
        [
            [{webNodeType: 'Test', a: 2}],
            {types: {Test: {a: {type: 'number', maximum: 1}}}}, 'Maximum'
        ],
        [
            [{webNodeType: 'Test', a: '12'}],
            {types: {Test: {a: {minimum: 3}}}}, 'MinimalLength'
        ],
        [
            [{webNodeType: 'Test', a: '12'}],
            {types: {Test: {a: {maximum: 1}}}}, 'MaximalLength'
        ],
        // endregion
        // region property pattern
        [
            [{webNodeType: 'Test', a: 'b'}],
            {types: {Test: {a: {regularExpressionPattern: 'a'}}}},
            'PatternMatch'
        ],
        // endregion
        // region property constraint
        [
            [{webNodeType: 'Test', a: 'b'}],
            {types: {Test: {a: {constraintEvaluation: 'false'}}}},
            'ConstraintEvaluation'
        ],
        [
            [{webNodeType: 'Test', a: 'b'}], {types: {Test: {a: {
                constraintEvaluation: 'newValue === "a"'
            }}}}, 'ConstraintEvaluation'
        ]
        // endregion
        */
    ]) {
        if (test.length < 3)
            test.splice(1, 0, {})
        const modelSpecifications:PlainObject = Helper.extendSpecification(
            Tools.extendObject(true, {}, defaultSpecification, test[1]))
        const options:PlainObject = Tools.copyLimitedRecursively(test[1])
        delete options.types
        const parameter:Array<any> = test[0].concat([null, {}, {}].slice(
            test[0].length - 1
        )).concat([modelSpecifications, options])
        console.log(Helper.representObject(parameter))
        assert.throws(():Object => Helper.validateDocumentUpdate.apply(
            this, parameter
        ), (error:DatabaseError):boolean => {
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
        [[{webNodeType: 'Test'}], {types: {Test: {}}}, {webNodeType: 'Test'}],
        [
            [{webNodeType: 'Test'}], {types: {Test: {class: {}}}},
            {webNodeType: 'Test'}
        ],
        [
            [{webNodeType: 'Test'}, {webNodeType: 'Test', a: '2'}],
            {types: {Test: {a: {}}}}, {webNodeType: 'Test'}
        ]/*,
        [
            [{webNodeType: 'Test', a: '2'}, {webNodeType: 'Test', a: '2'}],
            {types: {Test: {a: {}}}}
        ],
        [
            [
                {webNodeType: 'Test', a: '3'}, {webNodeType: 'Test', a: '2'},
                {a: '3'}
            ], {types: {Test: {a: {}}}}
        ],
        // region property existents
        [
            [{webNodeType: 'Test', a: 2}, {webNodeType: 'Test', a: 2}],
            {types: {Test: {a: {type: 'number'}}}}
        ],
        [
            [{webNodeType: 'Test', a: null}, {webNodeType: 'Test'}],
            {types: {Test: {a: {}}}}
        ],
        [
            [{webNodeType: 'Test', a: 'a'}, {webNodeType: 'Test', a: 'a'}],
            {types: {Test: {a: {nullable: false}}}}
        ],
        [
            [{webNodeType: 'Test'}, {webNodeType: 'Test', a: 'a'}],
            {types: {Test: {a: {nullable: false}}}}
        ],
        // endregion
        // region property readonly
        [
            [{webNodeType: 'Test', a: 'b'}, {webNodeType: 'Test', a: 'b'}],
            {types: {Test: {a: {writable: false}}}}
        ],
        [
            [{webNodeType: 'Test'}, {webNodeType: 'Test'}],
            {types: {Test: {a: {writable: false}}}}
        ],
        // endregion
        // region property type
        [
            [{webNodeType: 'Test', a: '2'}, {webNodeType: 'Test', a: '2'}],
            {types: {Test: {a: {}}}}
        ],
        [
            [{webNodeType: 'Test', a: 2}, {webNodeType: 'Test', a: 2}],
            {types: {Test: {a: {type: 'number'}}}}
        ],
        [
            [{webNodeType: 'Test', a: true}, {webNodeType: 'Test', a: true}],
            {types: {Test: {a: {type: 'boolean'}}}}
        ],
        [
            [{webNodeType: 'Test', a: 1}, {webNodeType: 'Test', a: 1}],
            {types: {Test: {a: {type: 'DateTime'}}}}
        ],
        // / region array
        [
            [{webNodeType: 'Test', a: ['2']}, {webNodeType: 'Test', a: ['2']}],
            {types: {Test: {a: {type: 'string[]'}}}}
        ],
        [
            [{webNodeType: 'Test', a: null}, {webNodeType: 'Test'}],
            {types: {Test: {a: {type: 'string[]'}}}}
        ],
        [
            [{webNodeType: 'Test', a: [2]}, {webNodeType: 'Test', a: [2]}],
            {types: {Test: {a: {type: 'number[]'}}}}
        ],
        [
            [
                {webNodeType: 'Test', a: [true]},
                {webNodeType: 'Test', a: [true]}
            ], {types: {Test: {a: {type: 'boolean[]'}}}}
        ],
        [
            [{webNodeType: 'Test', a: [1]}, {webNodeType: 'Test', a: [1]}],
            {types: {Test: {a: {type: 'DateTime[]'}}}}
        ],
        [
            [{webNodeType: 'Test', a: []}, {webNodeType: 'Test'}],
            {types: {Test: {a: {type: 'DateTime[]'}}}}
        ],
        [
            [{webNodeType: 'Test', a: [2]}, {webNodeType: 'Test', a: [2]}],
            {types: {Test: {a: {type: 'DateTime[]', writable: false}}}}
        ],
        [
            [
                {webNodeType: 'Test', a: [2, 1]},
                {webNodeType: 'Test', a: [2]}, {a: [2, 1]}
            ], {types: {Test: {a: {type: 'number[]'}}}}
        ],
        // / endregion
        // / region nested property
        // // region property type
        [
            [
                {webNodeType: 'Test', a: {webNodeType: 'Test'}},
                {webNodeType: 'Test', a: {webNodeType: 'Test'}}
            ], {types: {Test: {a: {type: 'Test'}}}}
        ],
        [
            [{webNodeType: 'Test', a: null}, {webNodeType: 'Test'}],
            {types: {Test: {a: {type: 'Test'}}}}
        ],
        [
            [
                {webNodeType: 'Test', a: {webNodeType: 'Test', b: null}},
                {webNodeType: 'Test', a: {webNodeType: 'Test'}}
            ], {types: {Test: {a: {type: 'Test'}, b: {}}}}
        ],
        [
            [
                {webNodeType: 'Test', a: {webNodeType: 'Test', b: '2'}},
                {webNodeType: 'Test', a: {webNodeType: 'Test', b: '2'}}
            ], {types: {Test: {a: {type: 'Test'}, b: {}}}}
        ],
        [
            [
                {
                    webNodeType: 'Test',
                    a: {webNodeType: 'Test', b: 'a'},
                    b: '2'
                },
                {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'a'}, b: '2'}
            ], {types: {Test: {a: {type: 'Test'}, b: {}}}}
        ],
        // // endregion
        // // region property existents
        [
            [
                {webNodeType: 'Test', a: {webNodeType: 'Test'}},
                {webNodeType: 'Test', a: {webNodeType: 'Test'}}
            ], {types: {Test: {a: {type: 'Test'}}}}
        ],
        [
            [
                {
                    webNodeType: 'Test',
                    a: {webNodeType: 'Test', b: null},
                    b: 'a'
                },
                {webNodeType: 'Test', a: {webNodeType: 'Test'}, b: 'a'}
            ], {types: {Test: {a: {type: 'Test'}, b: {}}}}
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
            ], {types: {Test: {a: {type: 'Test'}, b: {nullable: false}}}}
        ],
        // // endregion
        // // region property readonly
        [
            [
                {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'b'}},
                {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'b'}}
            ], {types: {Test: {a: {type: 'Test'}, b: {writable: false}}}}
        ],
        [
            [
                {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'a'}},
                {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'a'}}
            ], {types: {Test: {a: {type: 'Test', writable: false}, b: {}}}}
        ],
        // // endregion
        // // region property range
        [

            [
                {webNodeType: 'Test', a: 4, b: {webNodeType: 'Test', a: 3}},
                {webNodeType: 'Test', a: 4, b: {webNodeType: 'Test', a: 3}}
            ], {types: {Test: {
                a: {type: 'number', minimum: 3},
                b: {type: 'Test'}
            }}}
        ],
        [
            [
                {
                    webNodeType: 'Test',
                    a: '1',
                    b: {webNodeType: 'Test', a: '1'}
                },
                {webNodeType: 'Test', a: '1', b: {webNodeType: 'Test', a: '1'}}
            ], {types: {Test: {a: {maximum: 1}, b: {type: 'Test'}}}}
        ],
        // // endregion
        // // region property pattern
        [
            [
                {webNodeType: 'Test', b: {webNodeType: 'Test', a: 'a'}},
                {webNodeType: 'Test', b: {webNodeType: 'Test', a: 'a'}}
            ], {types: {Test: {
                a: {regularExpressionPattern: 'a'},
                b: {type: 'Test'}
            }}}
        ],
        // // endregion
        // // region property constraint
        [
            [
                {
                    webNodeType: 'Test',
                    a: 'b',
                    b: {webNodeType: 'Test', a: 'b'}
                },
                {webNodeType: 'Test', a: 'b', b: {webNodeType: 'Test', a: 'b'}}
            ], {types: {Test: {
                a: {constraint: 'newDocument.a === "b"'},
                b: {type: 'Test'}
            }}}
        ],
        // // endregion
        // / endregion
        [
            [
                {webNodeType: 'Test', a: 2}, {webNodeType: 'Test', a: 2}
            ], {types: {Test: {a: {type: 2}}}}
        ],
        // endregion
        // region property range
        [
            [{webNodeType: 'Test', a: 3}, {webNodeType: 'Test', a: 3}],
            {types: {Test: {a: {type: 'number', minimum: 3}}}}
        ],
        [
            [{webNodeType: 'Test', a: 1}, {webNodeType: 'Test', a: 1}],
            {types: {Test: {a: {type: 'number', maximum: 1}}}}
        ],
        [
            [{webNodeType: 'Test', a: '123'}, {webNodeType: 'Test', a: '123'}],
            {types: {Test: {a: {minimum: 3}}}}
        ],
        [
            [{webNodeType: 'Test', a: '1'}, {webNodeType: 'Test', a: '1'}],
            {types: {Test: {a: {maximum: 1}}}}
        ],
        // endregion
        // region property pattern
        [
            [{webNodeType: 'Test', a: 'a'}, {webNodeType: 'Test', a: 'a'}],
            {types: {Test: {a: {regularExpressionPattern: 'a'}}}}
        ],
        // endregion
        // region property constraint
        [
            [{webNodeType: 'Test', a: 'b'}, {webNodeType: 'Test', a: 'b'}],
            {types: {Test: {a: {constraintEvaluation: 'true'}}}}
        ],
        [
            [{webNodeType: 'Test', a: 'a'}, {webNodeType: 'Test', a: 'a'}],
            {types: {Test: {a: {constraintEvaluation: 'newDocument[key] === "a"'}}}}
        ]
        // endregion
        */
    ]) {
        const modelSpecifications:PlainObject = Helper.extendSpecification(
            Tools.extendObject(true, {}, defaultSpecification, test[1]))
        const options:PlainObject = Tools.copyLimitedRecursively(test[1])
        delete options.types
        console.log('C', test[
            0
        ].concat([null, {}, {}].slice(test[0].length - 1)).concat([
            modelSpecifications, options
        ]), Helper.validateDocumentUpdate.apply(this, test[
            0
        ].concat([null, {}, {}].slice(test[0].length - 1)).concat([
            modelSpecifications, options
        ])), test[2])
        assert.deepEqual(Helper.validateDocumentUpdate.apply(this, test[
            0
        ].concat([null, {}, {}].slice(test[0].length - 1)).concat([
            modelSpecifications, options
        ])), test[2])
    }
    // endregion
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
