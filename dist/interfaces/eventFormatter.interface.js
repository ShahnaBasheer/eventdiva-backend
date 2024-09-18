"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function responseFormatter(status, message, data) {
    return { status, message, data };
}
exports.default = responseFormatter;
