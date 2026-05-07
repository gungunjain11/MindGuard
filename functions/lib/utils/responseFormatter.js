"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorFormatter = exports.responseFormatter = void 0;
const responseFormatter = (data) => ({
    success: true,
    data,
});
exports.responseFormatter = responseFormatter;
const errorFormatter = (message) => ({
    success: false,
    error: message,
});
exports.errorFormatter = errorFormatter;
//# sourceMappingURL=responseFormatter.js.map