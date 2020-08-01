export type Maybe<T> = T | undefined;

export const enum Prefix {
  Major = '^',
  Minor = '~',
  Current = ''
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
  excludePaths?: string[];
  overwrite?: {
    [path: string]: FolderConfig;
  };
}
