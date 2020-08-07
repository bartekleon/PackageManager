"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractVersion = exports.getVersion = void 0;
const util_1 = require("./util");
const node_fetch_1 = require("node-fetch");
exports.getVersion = async (packageName, version) => {
    if (version) {
        version = `@${version}`;
    }
    try {
        const latest = await node_fetch_1.default(`https://unpkg.com/${packageName}${version || ''}/package.json`, { method: 'Get' }).then((res) => res.json());
        return latest.version;
    }
    catch (_) {
        return null;
    }
};
exports.extractVersion = (version) => {
    const vtag = util_1.getVersionPrefix(version);
    if (vtag !== '') {
        version = version.substr(1);
    }
    const els = version.split('.');
    switch (vtag) {
        case "" /* Current */:
            return els.join('.');
        case "~" /* Minor */:
            return `${els[0]}.${els[1]}`;
        case "^" /* Major */:
            return els[0];
    }
};
//# sourceMappingURL=getVersion.js.map