import { Prefix } from './config';

export const getVersionPrefix = (string: string): Prefix => {
  return (string.startsWith('~') || string.startsWith('^') ? string[0] : '') as Prefix;
};

export const isObject = (check: unknown): check is { [packageName: string]: string } => check !== undefined;
