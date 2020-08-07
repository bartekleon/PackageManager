"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
exports.logger = winston_1.createLogger({
    format: winston_1.format.printf(({ message }) => message),
    transports: [new winston_1.transports.Console(), new winston_1.transports.File({ filename: 'packageManager.log' })]
});
//# sourceMappingURL=logger.js.map