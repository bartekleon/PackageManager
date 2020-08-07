import { Prefix } from './config';
export declare const getVersionPrefix: (string: string) => Prefix;
export declare const isObject: (check: unknown) => check is {
    [packageName: string]: string;
};
