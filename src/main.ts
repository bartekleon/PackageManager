import { Config, Prefix, Maybe, defaultConfig } from './config';
import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs';
import { getVersionPrefix, isObject } from './util';
import { logger } from './logger';
import { extractVersion, getVersion } from './getVersion';

export class PackageManager {
  private config: Config = defaultConfig;

  public async run() {
    const configPath = path.resolve('pmj.conf.json');
    const conf = fs.existsSync(configPath) ? await import(configPath) : {};
    this.config = Object.assign({}, this.config, conf);

    glob(
      path.join(process.argv[2] || '.', '**', 'package.json'),
      {
        ignore: ['**/node_modules/**', ...(this.config.excludePaths || [])]
      },
      (err: Error | null, matches: string[]) => {
        if (err) {
          throw err;
        }
        matches.forEach(this.checkPackage);
      }
    );
  }

  private readonly checkPackage = (packagePath: string) => {
    import(path.resolve(packagePath)).then((json: Record<string, unknown>) => {
      const { devDependencies, dependencies, peerDependencies } = json;
      this.checkDependencies(devDependencies, 'devDependencies', packagePath);
      this.checkDependencies(dependencies, 'dependencies', packagePath);
      this.checkDependencies(peerDependencies, 'peerDependencies', packagePath);
    });
  };

  private readonly checkDependencies = (
    deps: unknown,
    type: 'devDependencies' | 'dependencies' | 'peerDependencies',
    packagePath: string
  ) => {
    if (isObject(deps)) {
      const overwrite = this.config.overwrite;
      let c: Maybe<Prefix>;
      if (overwrite) {
        const d = overwrite[packagePath][type];
        c = (d && d.defaultPrefix !== undefined && d.defaultPrefix) || overwrite[packagePath].defaultPrefix;
      }

      if (c === undefined) {
        const d = this.config[type];
        c = (d && d.defaultPrefix !== undefined && d.defaultPrefix) || this.config.defaultPrefix;
      }

      for (const packageName in deps) {
        let final = c;
        if (overwrite && overwrite[packagePath][type]) {
          final = (overwrite[packagePath][type] as any)[packageName];
        }
        const starts = getVersionPrefix(deps[packageName]);
        if (starts !== final) {
          const currentVersion = deps[packageName];
          fs.readFileSync(packagePath, 'utf8')
            .split(/\r?\n/)
            .forEach((line, idx) => {
              if (line.includes(packageName) && line.includes(currentVersion)) {
                (async () => {
                  const version = this.config.checkVersions && (await getVersion(packageName, extractVersion(currentVersion)));
                  logger.warn(
                    `${path.resolve(packagePath)}: line ${
                      idx + 1
                    }, Error - ${line.trim()} expected prefix "${final}", but got "${starts}". ${
                      version
                        ? `Consider ${
                            currentVersion.includes(version) ? ', if possible, ' : ''
                          } changing it to "${packageName}" : "${final}${version}"`
                        : ''
                    }`
                  );
                })();
              }
            });
        }
      }
    }
  };
}

const Run = new PackageManager().run;

export { Run };
