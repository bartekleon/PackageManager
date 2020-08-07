"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = exports.getVersionPrefix = void 0;
exports.getVersionPrefix = (string) => {
    return (string.startsWith('~') || string.startsWith('^') ? string[0] : '');
};
exports.isObject = (check) => check !== undefined;
//# sourceMappingURL=util.js.map