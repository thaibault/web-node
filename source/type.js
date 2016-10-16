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
// / region model
export type AllowedModelRolesMapping = {[key:string]:Array<string>}
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
export type Model = {
    webNodeExtends:Array<string>;
    [key:string]:PropertySpecification;
}
export type Models = {[key:string]:Model}
export type SpecialPropertyNames = {
    allowedRoles:string;
    extend:string;
    type:string;
    typeNameRegularExpressionPattern:string;
}
export type ModelConfiguration = {
    reservedPropertyNames:Array<string>;
    specialPropertyNames:SpecialPropertyNames;
    defaultPropertySpecification:PropertySpecification;
    models:Models;
}
export type SimpleModelConfiguration = {
    reservedPropertyNames:Array<string>;
    specialPropertyNames:SpecialPropertyNames;
}
// / endregion
// / region configuration
export type Configuration = {
    debug:boolean;
    encoding:string;
    name:string;
    model:ModelConfiguration;
}
// / endregion
// / region database error
export type DatabaseAuthorisationError = {
    unauthorized:string;
    toString:() => string;
}
export type DatabaseForbiddenError = {
    forbidden:string;
    toString:() => string;
}
export type DatabaseError = DatabaseAuthorisationError|DatabaseForbiddenError
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
