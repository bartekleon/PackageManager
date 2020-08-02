import { Config, Prefix, Maybe, defaultConfig } from './config';
import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs';
import { getVersionPrefix, isObject } from './util';
import { logger } from './logger';
import { extractVersion, getVersion } from './getVersion';

const checkDependencies = (
  deps: unknown,
  type: 'devDependencies' | 'dependencies' | 'peerDependencies',
  config: Config,
  packagePath: string
) => {
  if (isObject(deps)) {
    const overwrite = config.overwrite;
    let c: Maybe<Prefix>;
    if (overwrite) {
      const d = overwrite[packagePath][type];
      c = (d && d.defaultPrefix !== undefined && d.defaultPrefix) || overwrite[packagePath].defaultPrefix;
    }

    if (c === undefined) {
      const d = config[type];
      c = (d && d.defaultPrefix !== undefined && d.defaultPrefix) || config.defaultPrefix;
    }

    for (const packageName in deps) {
      let final = c;
      if (config.overwrite && config.overwrite[packagePath][type]) {
        final = (config.overwrite[packagePath][type] as any)[packageName];
      }
      const starts = getVersionPrefix(deps[packageName]);
      if (starts !== final) {
        const file = fs.readFileSync(packagePath, 'utf8');
        const currentVersion = deps[packageName];
        file.split(/\r?\n/).forEach((line, idx) => {
          if (line.includes(packageName) && line.includes(currentVersion)) {
            (async () => {
              const version = config.checkVersions && (await getVersion(packageName, extractVersion(currentVersion)));
              if (version) {
                logger.warn(
                  `${path.resolve(packagePath)}: line ${
                    idx + 1
                  }, Error - ${line.trim()} expected prefix "${final}", but got "${starts}". Consider ${
                    currentVersion.includes(version) ? ', if possible, ' : ''
                  } changing it to "${packageName}" : "${final}${version}"`
                );
              } else {
                logger.warn(
                  `${path.resolve(packagePath)}: line ${
                    idx + 1
                  }, Error - ${line.trim()} expected prefix "${final}", but got "${starts}".`
                );
              }
            })();
          }
        });
      }
    }
  }
};

const checkPackage = (packagePath: string, config: Config) => {
  import(path.resolve(packagePath)).then((json: Record<string, unknown>) => {
    const { devDependencies, dependencies, peerDependencies } = json;
    checkDependencies(devDependencies, 'devDependencies', config, packagePath);
    checkDependencies(dependencies, 'dependencies', config, packagePath);
    checkDependencies(peerDependencies, 'peerDependencies', config, packagePath);
  });
};

export const Run = async () => {
  let conf = {};
  try {
    conf = await import(path.resolve('pmj.conf.json'));
  } catch (_) {
    // Config not found, procceed with default one
  }
  const config = Object.assign({}, defaultConfig, conf);

  glob(
    path.join(process.argv[2] || '.', '**', 'package.json'),
    {
      ignore: ['**/node_modules/**', ...(config.excludePaths || [])]
    },
    (err: Error | null, matches: string[]) => {
      if (err) {
        throw err;
      }
      matches.forEach((packagePath) => checkPackage(packagePath, config));
    }
  );
};

Run();
