export type Maybe<T> = T | undefined;

export const enum Prefix {
  Major = '^',
  Minor = '~',
  Current = ''
}

export interface Config {
  defaultPrefix: Prefix;
  excludePaths?: string[];
  overwrite?: {
    [path: string]: {
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
    };
  };
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
