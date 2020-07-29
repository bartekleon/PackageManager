import { Config, Prefix, Maybe } from './config';
import { glob } from 'glob';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

const myFormat = winston.format.printf(({ message }) => message);

const logger = winston.createLogger({
  format: myFormat,
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'packageManager.log' })]
});

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
      if (d) {
        c = d.defaultPrefix;
      }
      if (c === undefined) {
        c = overwrite[packagePath].defaultPrefix;
      }
    }

    if (c === undefined) {
      const d = config[type];
      if (d) {
        c = d.defaultPrefix;
      }
      if (c === undefined) {
        c = config.defaultPrefix;
      }
    }

    for (const packageName in deps) {
      let final = c;
      if (config.overwrite && config.overwrite[packagePath][type]) {
        final = (config.overwrite[packagePath][type] as any)[packageName];
      }
      if (!deps[packageName].startsWith(final)) {
        const file = fs.readFileSync(packagePath, 'utf8');
        file.split(/\r?\n/).forEach((line, idx) => {
          if (line.includes(packageName) && line.includes(deps[packageName])) {
            const starts = deps[packageName].startsWith('~') || deps[packageName].startsWith('^') ? deps[packageName][0] : '';
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
  const normalized = path.resolve(packagePath);

  import(normalized).then((json: Record<string, unknown>) => {
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
