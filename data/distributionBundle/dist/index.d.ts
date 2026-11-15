export * from './configurator';
export * from './pluginAPI';
import type { PluginPreloader } from './type';
import { Logger } from 'clientnode';
export declare const log: Logger;
export declare const main: (pluginLoaderMapping?: PluginPreloader) => Promise<void>;
export declare const isMainModulePositiveCalls: {
    value: number;
};
export declare const isMainModule: (filename?: string, onlyOnce?: boolean) => Promise<boolean>;
export default main;
