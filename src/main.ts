import { Config, Prefix, Maybe } from './config';
import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs';
import { getVersionPrefix } from './util';
import { logger } from './logger';

const defaultConfig: Config = {
  defaultPrefix: Prefix.Minor
};

const isObject = (check: unknown): check is { [packageName: string]: string } => {
  return check !== undefined;
};

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
      c = (d && d.defaultPrefix) ?? overwrite[packagePath].defaultPrefix;
    }

    if (c === undefined) {
      const d = config[type];
      c = (d && d.defaultPrefix) ?? config.defaultPrefix;
    }

    for (const packageName in deps) {
      let final = c;
      if (config.overwrite && config.overwrite[packagePath][type]) {
        final = (config.overwrite[packagePath][type] as any)[packageName];
      }
      const starts = getVersionPrefix(deps[packageName]);
      if (starts !== final) {
        const file = fs.readFileSync(packagePath, 'utf8');
        file.split(/\r?\n/).forEach((line, idx) => {
          if (line.includes(packageName) && line.includes(deps[packageName])) {
            logger.warn(
              `${path.resolve(packagePath)}: line ${
                idx + 1
              }, Error - ${line.trim()} expected prefix "${final}", but got "${starts}"`
            );
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
