"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Run = exports.PackageManager = void 0;
const config_1 = require("./config");
const glob_1 = require("glob");
const path = require("path");
const fs = require("fs");
const util_1 = require("./util");
const logger_1 = require("./logger");
const getVersion_1 = require("./getVersion");
class PackageManager {
    constructor(argv) {
        this.argv = argv;
        this.config = config_1.defaultConfig;
        this.checkPackage = (packagePath) => {
            Promise.resolve().then(() => require(path.resolve(packagePath))).then((json) => {
                const { devDependencies, dependencies, peerDependencies } = json;
                this.checkDependencies(devDependencies, 'devDependencies', packagePath);
                this.checkDependencies(dependencies, 'dependencies', packagePath);
                this.checkDependencies(peerDependencies, 'peerDependencies', packagePath);
            });
        };
        this.checkDependencies = (deps, type, packagePath) => {
            if (util_1.isObject(deps)) {
                const overwrite = this.config.overwrite;
                let c;
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
                        final = overwrite[packagePath][type][packageName];
                    }
                    else if (this.config[type] && this.config[type][packageName]) {
                        final = this.config[type][packageName];
                    }
                    const starts = util_1.getVersionPrefix(deps[packageName]);
                    if (starts !== final) {
                        const currentVersion = deps[packageName];
                        fs.readFileSync(packagePath, 'utf8')
                            .split(/\r?\n/)
                            .forEach((line, idx) => {
                            if (line.includes(packageName) && line.includes(currentVersion)) {
                                (async () => {
                                    const version = this.config.checkVersions && (await getVersion_1.getVersion(packageName, getVersion_1.extractVersion(currentVersion)));
                                    logger_1.logger.warn(`${path.resolve(packagePath)}: line ${idx + 1}, Error - ${line.trim()} expected prefix "${final}", but got "${starts}". ${version
                                        ? `Consider ${currentVersion.includes(version) ? ', if possible, ' : ''} changing it to "${packageName}" : "${final}${version}"`
                                        : ''}`);
                                })();
                            }
                        });
                    }
                }
            }
        };
    }
    async run() {
        const configPath = path.resolve('pmj.conf.json');
        const conf = fs.existsSync(configPath) ? await Promise.resolve().then(() => require(configPath)) : {};
        this.config = Object.assign({}, this.config, conf);
        glob_1.glob(path.join((this.argv && this.argv[2]) || '.', '**', 'package.json'), {
            ignore: ['**/node_modules/**', ...(this.config.excludePaths || [])]
        }, (err, matches) => {
            if (err) {
                throw err;
            }
            matches.forEach(this.checkPackage);
        });
    }
}
exports.PackageManager = PackageManager;
const Run = new PackageManager().run;
exports.Run = Run;
//# sourceMappingURL=main.js.map