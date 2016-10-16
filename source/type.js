// @flow
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons naming
    3.0 unported license. see http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region exports
export type PropertySpecification = {
    type:string;
    default:any;
    onCreateEvaluation:?string;
    onCreateExpression:?string;
    onUpdateEvaluation:?string;
    onUpdateExpression:?string;
    nullable:boolean;
    writable:boolean;
    mutable:boolean;
    minimum:number;
    maximum:number;
    regularExpressionPattern:?string;
    constraintEvaluation:?string;
    constraintExpression:?string;
}
export type Model = {[key:string]:PropertySpecification}
export type Models = {[key:string]:Model}
export type ModelConfiguration = {
    specialPropertyNames:{
        allowedRoles:string;
        extend:string;
        type:string;
        typeNameRegularExpressionPattern:string;
    };
    defaultPropertySpecification:PropertySpecification;
    types:Models;
}
export type Configuration = {
    debug:boolean;
    encoding:string;
    name:string;
    model:ModelConfiguration;
}
export type DatabaseAuthorisationError = {
    unauthorized:string;
    toString:() => string;
}
export type DatabaseForbiddenError = {
    forbidden:string;
    toString:() => string;
}
export type DatabaseError = DatabaseAuthorisationError|DatabaseForbiddenError
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
