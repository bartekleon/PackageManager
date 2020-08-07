export declare type Maybe<T> = T | undefined;
export declare const enum Prefix {
    Major = "^",
    Minor = "~",
    Current = ""
}
interface FolderConfig {
    defaultPrefix: Prefix;
    dependencies?: {
        defaultPrefix?: Prefix;
        [dependency: string]: Maybe<Prefix>;
    };
    devDependencies?: {
        defaultPrefix?: Prefix;
        [dependency: string]: Maybe<Prefix>;
    };
    peerDependencies?: {
        defaultPrefix?: Prefix;
        [dependency: string]: Maybe<Prefix>;
    };
}
export interface Config extends FolderConfig {
    checkVersions?: boolean;
    excludePaths?: string[];
    overwrite?: {
        [path: string]: FolderConfig;
    };
}
export declare const defaultConfig: Config;
export {};
