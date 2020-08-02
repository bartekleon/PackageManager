import { Prefix } from './config';
import { getVersionPrefix } from './util';
import fetch from 'node-fetch';

export const getVersion = async (packageName: string, version?: string) => {
  if (version) {
    version = `@${version}`;
  }
  try {
    const latest = await fetch(`https://unpkg.com/${packageName}${version}/package.json`, { method: 'Get' }).then((res) =>
      res.json()
    );
    const v = latest.version;
    return v;
  } catch (_) {
    return null;
  }
};

export const extractVersion = (version: string) => {
  const vtag = getVersionPrefix(version);

  if (vtag !== '') {
    version = version.substr(1);
  }

  const els = version.split('.');

  switch (vtag) {
    case Prefix.Current:
      return els.join('.');
    case Prefix.Minor:
      return `${els[0]}.${els[1]}`;
    case Prefix.Major:
      return els[0];
  }
};
