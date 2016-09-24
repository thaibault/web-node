// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import Tools from 'clientnode'
import * as QUnit from 'qunit-cli'
import type {PlainObject} from 'weboptimizer/type'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import configuration from '../configurator'
import type {DatabaseError} from '../type'
import Helper from '../helper'
// endregion
QUnit.module('helper')
QUnit.load()
// region tests
QUnit.test('extendModel', (assert:Object):void => {
    for (const test:Array<any> of [
        ['A', {A: {}}, {}],
        ['A', {A: {}}, {}],
        [
            'Test',
            {_baseTest: {b: {}}, Test: {a: {}, _extend: '_baseTest'}},
            {a: {}, b: {}}
        ],
        [
            'C',
            {
                A: {a: {}},
                B: {b: {}},
                C: {c: {}, _extend: ['A', 'B']}
            },
            {a: {}, b: {}, c: {}}
        ]/*,
        [
            {types: {
                A: {a: {}},
                B: {b: {}, _extend: 'A'},
                C: {c: {}, _extend: 'B'}
            }},
            {A: {a: {}}, B: {a: {}, b: {}}, C: {a: {}, b: {}, c: {}}}
        ]
        */
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
            {types: {Base: {b: {}}, Test: {a: {}, _extend: 'Base'}}},
            {Base: {b: {}}, Test: {a: {}, b: {}}}
        ],
        [
            {types: {_base: {b: {}}, Test: {a: {}}}},
            {Test: {a: {}, b: {}}}
        ]
    ])
        assert.deepEqual(Helper.extendSpecification(test[0]), test[1])
    assert.throws(Helper.extendSpecification({
        type: {a: {}}
    }))
})
QUnit.test('generateValidateDocumentUpdateFunctionCode', (
    assert:Object
):void => {
    // region forbidden write tests
    for (const test:Array<any> of [
        // region model
        [{}, {}, {}, {}, {}, 'Type'],
        [{}, {webNodeType: 'test'}, null, {}, {}, 'Model'],
        // endregion
        // region property existents
        [
            {types: {Test: {}}},
            {webNodeType: 'Test', a: 2},
            null, {}, {}, 'Property'
        ],
        [
            {types: {Test: {a: {nullable: false}}}},
            {webNodeType: 'Test', a: null},
            null, {}, {}, 'NotNull'
        ],
        [
            {types: {Test: {a: {nullable: false}}}},
            {webNodeType: 'Test'},
            null, {}, {}, 'MissingProperty'
        ],
        // endregion
        // region property readonly
        [
            {types: {Test: {a: {writable: false}}}},
            {webNodeType: 'Test', a: 'b'},
            {
                creationDateTime: new Date().getTime(),
                updateDateTime: new Date().getTime(),
                webNodeType: 'Test'
            }, {}, {}, 'Readonly'
        ],
        [
            {types: {Test: {a: {writable: false}}}},
            {webNodeType: 'Test', a: 'b'},
            {
                a: 'a',
                creationDateTime: new Date().getTime(),
                updateDateTime: new Date().getTime(),
                webNodeType: 'Test'
            }, {}, {}, 'Readonly'
        ],
        // endregion
        // region property type
        [
            {types: {Test: {a: {}}}},
            {webNodeType: 'Test', a: 2},
            null, {}, {}, 'PropertyType'
        ],
        [
            {types: {Test: {a: {type: 'number'}}}},
            {webNodeType: 'Test', a: 'b'},
            null, {}, {}, 'PropertyType'
        ],
        [
            {types: {Test: {a: {type: 'boolean'}}}},
            {webNodeType: 'Test', a: 1},
            null, {}, {}, 'PropertyType'
        ],
        [
            {types: {Test: {a: {type: 'DateTime'}}}},
            {webNodeType: 'Test', a: 'a'},
            null, {}, {}, 'PropertyType'
        ],
        [
            {types: {Test: {a: {type: 'Test'}}}},
            {webNodeType: 'Test', a: 1},
            null, {}, {}, 'NestedModel'
        ],
        // / region nested property
        // // region property type
        [
            {types: {Test: {a: {type: 'Test'}}}},
            {webNodeType: 'Test', a: 1},
            null, {}, {}, 'NestedModel'
        ],
        [
            {types: {Test: {a: {type: 'Test', nullable: false}}}},
            {webNodeType: 'Test', a: null},
            null, {}, {}, 'NotNull'
        ],
        [
            {types: {Test: {a: {type: 'Test'}}}},
            {webNodeType: 'Test', a: {}},
            null, {}, {}, 'Type'
        ],
        [
            {types: {Test: {a: {type: 'Test'}, b: {}}}},
            {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'a'}, b: 2},
            null, {}, {}, 'PropertyType'
        ],
        // // endregion
        // // region property existents
        [
            {types: {Test: {a: {type: 'Test'}}}},
            {webNodeType: 'Test', a: {webNodeType: 'Test', b: 2}},
            null, {}, {}, 'Property'
        ],
        [
            {types: {Test: {
                a: {type: 'Test'},
                b: {nullable: false}
            }}}, {
                webNodeType: 'Test',
                a: {webNodeType: 'Test', b: null},
                b: 'a'
            },
            null, {}, {}, 'NotNull'
        ],
        [
            {types: {Test: {
                a: {type: 'Test'},
                b: {nullable: false}
            }}}, {
                webNodeType: 'Test',
                a: {webNodeType: 'Test'},
                b: 'a'
            },
            null, {}, {}, 'MissingProperty'
        ],
        // // endregion
        // // region property readonly
        [
            {types: {Test: {
                a: {type: 'Test'},
                b: {writable: false}
            }}}, {
                webNodeType: 'Test',
                a: {webNodeType: 'Test', b: 'a'}
            },
            {
                a: {
                    b: 'b',
                    creationDateTime: new Date().getTime(),
                    updateDateTime: new Date().getTime(),
                    webNodeType: 'Test'
                },
                creationDateTime: new Date().getTime(),
                updateDateTime: new Date().getTime(),
                webNodeType: 'Test'
            }, {}, {}, 'Readonly'
        ],
        [
            {types: {Test: {
                a: {type: 'Test'},
                b: {writable: false}
            }}}, {
                webNodeType: 'Test',
                a: {webNodeType: 'Test', b: 'a'}
            },
            {
                a: {
                    creationDateTime: new Date().getTime(),
                    updateDateTime: new Date().getTime(),
                    webNodeType: 'Test'
                },
                creationDateTime: new Date().getTime(),
                updateDateTime: new Date().getTime(),
                webNodeType: 'Test'
            }, {}, {}, 'Readonly'
        ],
        // // endregion
        // // region property range
        [
            {types: {Test: {
                a: {type: 'number', minimum: 3},
                b: {type: 'Test'}
            }}},
            {webNodeType: 'Test', a: 4, b: {webNodeType: 'Test', a: 2}},
            null, {}, {}, 'Minimum'
        ],
        [
            {types: {Test: {a: {maximum: 1}, b: {type: 'Test'}}}},
            {webNodeType: 'Test', a: '1', b: {webNodeType: 'Test', a: '12'}},
            null, {}, {}, 'MaximalLength'
        ],
        // // endregion
        // // region property pattern
        [
            {types: {Test: {
                a: {regularExpressionPattern: 'a'},
                b: {type: 'Test'}
            }}},
            {webNodeType: 'Test', b: {webNodeType: 'Test', a: 'b'}},
            null, {}, {}, 'PatternMatch'
        ],
        // // endregion
        // // region property constraint
        [
            {types: {Test: {
                a: {constraint: 'newDocument.a === "b"'},
                b: {type: 'Test'}
            }}},
            {webNodeType: 'Test', a: 'b', b: {webNodeType: 'Test', a: 'a'}},
            null, {}, {}, 'Constraint'
        ],
        // // endregion
        // / endregion
        [
            {types: {Test: {a: {type: 2}}}},
            {webNodeType: 'Test', a: 1},
            null, {}, {}, 'PropertyType'
        ],
        // endregion
        // region property range
        [
            {types: {Test: {a: {type: 'number', minimum: 3}}}},
            {webNodeType: 'Test', a: 2},
            null, {}, {}, 'Minimum'
        ],
        [
            {types: {Test: {a: {type: 'number', maximum: 1}}}},
            {webNodeType: 'Test', a: 2},
            null, {}, {}, 'Maximum'
        ],
        [
            {types: {Test: {a: {minimum: 3}}}},
            {webNodeType: 'Test', a: '12'},
            null, {}, {}, 'MinimalLength'
        ],
        [
            {types: {Test: {a: {maximum: 1}}}},
            {webNodeType: 'Test', a: '12'},
            null, {}, {}, 'MaximalLength'
        ],
        // endregion
        // region property pattern
        [
            {types: {Test: {a: {regularExpressionPattern: 'a'}}}},
            {webNodeType: 'Test', a: 'b'},
            null, {}, {}, 'PatternMatch'
        ],
        // endregion
        // region property constraint
        [
            {types: {Test: {a: {constraint: 'false'}}}},
            {webNodeType: 'Test', a: 'b'},
            null, {}, {}, 'Constraint'
        ],
        [
            {types: {Test: {a: {constraint: 'newDocument[key] === "a"'}}}},
            {webNodeType: 'Test', a: 'b'},
            null, {}, {}, 'Constraint'
        ]
        // endregion
    ]) {
        const modelSpecification:PlainObject = Tools.extendObject(
            true, {}, configuration.model, test[0])
        const functionCode:string =
            Helper.generateValidateDocumentUpdateFunctionCode(
                modelSpecification)
        assert.strictEqual(typeof functionCode, 'string')
        const validatorGenerator:Function = new Function(
            'toJSON', `return ${functionCode}`)
        assert.strictEqual(typeof validatorGenerator, 'function')
        const validator:Function = validatorGenerator(JSON.stringify)
        assert.strictEqual(typeof validator, 'function')
        assert.throws(():void => validator.apply(this, test.slice(
            1, test.length - 1
        )), (error:DatabaseError):boolean => {
            if (error.hasOwnProperty('forbidden')) {
                const result:boolean = error.forbidden.startsWith(
                    `${test[test.length - 1]}:`)
                if (!result)
                    console.log(
                        `Error "${error.forbidden}" doesn't start with "` +
                        `${test[test.length - 1]}:".`)
                return result
            }
            // IgnoreTypeCheck
            console.log(`Unexpeced error "${error}" was thrown.`)
            return false
        })
    }
    // endregion
    // region allowed write tests
    //for (const test:Array<any> of [
        /*
        // region model
        [{}, {}, {}, {}, {}, 'Type'],
        [{}, {webNodeType: 'test'}, null, {}, {}, 'Model'],
        // endregion
        // region property existents
        [
            {types: {Test: {}}},
            {webNodeType: 'Test', a: 2},
            null, {}, {}, 'Property'
        ],
        [
            {types: {Test: {a: {nullable: false}}}},
            {webNodeType: 'Test', a: null},
            null, {}, {}, 'NotNull'
        ],
        [
            {types: {Test: {a: {nullable: false}}}},
            {webNodeType: 'Test'},
            null, {}, {}, 'MissingProperty'
        ],
        // endregion
        // region property readonly
        [
            {types: {Test: {a: {writable: false}}}},
            {webNodeType: 'Test', a: 'b'},
            {
                creationDateTime: new Date().getTime(),
                updateDateTime: new Date().getTime(),
                webNodeType: 'Test'
            }, {}, {}, 'Readonly'
        ],
        [
            {types: {Test: {a: {writable: false}}}},
            {webNodeType: 'Test', a: 'b'},
            {
                a: 'a',
                creationDateTime: new Date().getTime(),
                updateDateTime: new Date().getTime(),
                webNodeType: 'Test'
            }, {}, {}, 'Readonly'
        ],
        // endregion
        // region property type
        [
            {types: {Test: {a: {}}}},
            {webNodeType: 'Test', a: 2},
            null, {}, {}, 'PropertyType'
        ],
        [
            {types: {Test: {a: {type: 'number'}}}},
            {webNodeType: 'Test', a: 'b'},
            null, {}, {}, 'PropertyType'
        ],
        [
            {types: {Test: {a: {type: 'boolean'}}}},
            {webNodeType: 'Test', a: 1},
            null, {}, {}, 'PropertyType'
        ],
        [
            {types: {Test: {a: {type: 'DateTime'}}}},
            {webNodeType: 'Test', a: 'a'},
            null, {}, {}, 'PropertyType'
        ],
        [
            {types: {Test: {a: {type: 'Test'}}}},
            {webNodeType: 'Test', a: 1},
            null, {}, {}, 'NestedModel'
        ],
        // / region nested property
        // // region property type
        [
            {types: {Test: {a: {type: 'Test'}}}},
            {webNodeType: 'Test', a: 1},
            null, {}, {}, 'NestedModel'
        ],
        [
            {types: {Test: {a: {type: 'Test', nullable: false}}}},
            {webNodeType: 'Test', a: null},
            null, {}, {}, 'NotNull'
        ],
        [
            {types: {Test: {a: {type: 'Test'}}}},
            {webNodeType: 'Test', a: {}},
            null, {}, {}, 'Type'
        ],
        [
            {types: {Test: {a: {type: 'Test'}, b: {}}}},
            {webNodeType: 'Test', a: {webNodeType: 'Test', b: 'a'}, b: 2},
            null, {}, {}, 'PropertyType'
        ],
        // // endregion
        // // region property existents
        [
            {types: {Test: {a: {type: 'Test'}}}},
            {webNodeType: 'Test', a: {webNodeType: 'Test', b: 2}},
            null, {}, {}, 'Property'
        ],
        [
            {types: {Test: {
                a: {type: 'Test'},
                b: {nullable: false}
            }}}, {
                webNodeType: 'Test',
                a: {webNodeType: 'Test', b: null},
                b: 'a'
            },
            null, {}, {}, 'NotNull'
        ],
        [
            {types: {Test: {
                a: {type: 'Test'},
                b: {nullable: false}
            }}}, {
                webNodeType: 'Test',
                a: {webNodeType: 'Test'},
                b: 'a'
            },
            null, {}, {}, 'MissingProperty'
        ],
        // // endregion
        // // region property readonly
        [
            {types: {Test: {
                a: {type: 'Test'},
                b: {writable: false}
            }}}, {
                webNodeType: 'Test',
                a: {webNodeType: 'Test', b: 'a'}
            },
            {
                a: {
                    b: 'b',
                    creationDateTime: new Date().getTime(),
                    updateDateTime: new Date().getTime(),
                    webNodeType: 'Test'
                },
                creationDateTime: new Date().getTime(),
                updateDateTime: new Date().getTime(),
                webNodeType: 'Test'
            }, {}, {}, 'Readonly'
        ],
        [
            {types: {Test: {
                a: {type: 'Test'},
                b: {writable: false}
            }}}, {
                webNodeType: 'Test',
                a: {webNodeType: 'Test', b: 'a'}
            },
            {
                a: {
                    creationDateTime: new Date().getTime(),
                    updateDateTime: new Date().getTime(),
                    webNodeType: 'Test'
                },
                creationDateTime: new Date().getTime(),
                updateDateTime: new Date().getTime(),
                webNodeType: 'Test'
            }, {}, {}, 'Readonly'
        ],
        // // endregion
        // // region property range
        [
            {types: {Test: {
                a: {type: 'number', minimum: 3},
                b: {type: 'Test'}
            }}},
            {webNodeType: 'Test', a: 4, b: {webNodeType: 'Test', a: 2}},
            null, {}, {}, 'Minimum'
        ],
        [
            {types: {Test: {a: {maximum: 1}, b: {type: 'Test'}}}},
            {webNodeType: 'Test', a: '1', b: {webNodeType: 'Test', a: '12'}},
            null, {}, {}, 'MaximalLength'
        ],
        // // endregion
        // // region property pattern
        [
            {types: {Test: {
                a: {regularExpressionPattern: 'a'},
                b: {type: 'Test'}
            }}},
            {webNodeType: 'Test', b: {webNodeType: 'Test', a: 'b'}},
            null, {}, {}, 'PatternMatch'
        ],
        // // endregion
        // // region property constraint
        [
            {types: {Test: {
                a: {constraint: 'newDocument.a === "b"'},
                b: {type: 'Test'}
            }}},
            {webNodeType: 'Test', a: 'b', b: {webNodeType: 'Test', a: 'a'}},
            null, {}, {}, 'Constraint'
        ],
        // // endregion
        // / endregion
        [
            {types: {Test: {a: {type: 2}}}},
            {webNodeType: 'Test', a: 1},
            null, {}, {}, 'PropertyType'
        ],
        // endregion
        // region property range
        [
            {types: {Test: {a: {type: 'number', minimum: 3}}}},
            {webNodeType: 'Test', a: 2},
            null, {}, {}, 'Minimum'
        ],
        [
            {types: {Test: {a: {type: 'number', maximum: 1}}}},
            {webNodeType: 'Test', a: 2},
            null, {}, {}, 'Maximum'
        ],
        [
            {types: {Test: {a: {minimum: 3}}}},
            {webNodeType: 'Test', a: '12'},
            null, {}, {}, 'MinimalLength'
        ],
        [
            {types: {Test: {a: {maximum: 1}}}},
            {webNodeType: 'Test', a: '12'},
            null, {}, {}, 'MaximalLength'
        ],
        // endregion
        // region property pattern
        [
            {types: {Test: {a: {regularExpressionPattern: 'a'}}}},
            {webNodeType: 'Test', a: 'b'},
            null, {}, {}, 'PatternMatch'
        ],
        // endregion
        // region property constraint
        [
            {types: {Test: {a: {constraint: 'false'}}}},
            {webNodeType: 'Test', a: 'b'},
            null, {}, {}, 'Constraint'
        ],
        [
            {types: {Test: {a: {constraint: 'newDocument[key] === "a"'}}}},
            {webNodeType: 'Test', a: 'b'},
            null, {}, {}, 'Constraint'
        ]
        // endregion
        */
    /*]) {
        const modelSpecification:PlainObject = Tools.extendObject(
            true, {}, configuration.model, test[0])
        const functionCode:string =
            Helper.generateValidateDocumentUpdateFunctionCode(
                modelSpecification)
        assert.strictEqual(typeof functionCode, 'string')
        const validatorGenerator:Function = new Function(
            'toJSON', `return ${functionCode}`)
        assert.strictEqual(typeof validatorGenerator, 'function')
        const validator:Function = validatorGenerator(JSON.stringify)
        assert.strictEqual(typeof validator, 'function')
        assert.strictEqual(typeof validator.apply(this, test.slice(
            1, test.length - 1
        )), 'object')
    }
    */
    // endregion
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
