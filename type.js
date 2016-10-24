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
// region imports
import type {PlainObject} from 'clientnode'
// endregion
// region exports
export type Configuration = {
    context:{
        path:string;
        type:string;
    };
    debug:boolean;
    encoding:string;
    name:string;
    package:PlainObject;
    plugin:{
        configurationPropertyNames:Array<string>;
        directories:{
            internal:{
                path:string;
                nameRegularExpressionPattern:string;
            };
            external:{
                path:string;
                nameRegularExpressionPattern:string;
            };
        };
        hotReloading:boolean;
    };
    [key:string]:any;
}
export type Plugin = {
    api:?Function;
    apiFilePath:?string;
    apiFileLoadTimestamp:?number;
    configuration:?PlainObject;
    configurationFilePath:?string;
    configurationFileLoadTimestamp:?number;
    name:string;
    path:string;
    scope:?Object;
}
export type Services = {[key:string]:Object}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
