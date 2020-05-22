// #!/usr/bin/env node
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
import {Encoding, PlainObject} from 'clientnode/type'
// endregion
// region exports
export type MetaConfiguration = {
    fileNames:Array<string>;
    propertyNames:Array<string>;
}
export type Configuration = {
    context:{
        path:string;
        type:string;
    };
    debug:boolean;
    encoding:Encoding;
    interDependencies:PlainObject;
    name:string;
    package:PlainObject;
    plugin:{
        configuration:MetaConfiguration;
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
    api:Function|null;
    apiFilePaths:Array<string>;
    apiFileLoadTimestamps:Array<number>;
    configuration:PlainObject;
    configurationFilePaths:Array<string>;
    configurationFileLoadTimestamps:Array<number>;
    dependencies:Array<string>;
    internalName:string;
    name:string;
    path:string;
    scope:null|object;
}
export type PluginChange = {
    newScope:object;
    oldScope:null|object;
    plugin:Plugin;
    target:'configuration'|'scope';
}
export type PluginConfiguration = PlainObject & {
    dependencies?:Array<string>;
}
export type Service = {name:string;promise:Promise<object>}
export type Services = {[key:string]:Service}
export type ServicePromises = {[key:string]:Promise<Service>}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
