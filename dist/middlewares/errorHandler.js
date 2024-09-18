"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const customError_1 = require("../errors/customError");
function notFoundHandler(req, res) {
    return res.status(404).json({ status: 'not-found', message: `Not Found: ${req.originalUrl}` });
}
exports.notFoundHandler = notFoundHandler;
function errorHandler(error, req, res, next) {
    console.log('An error occurred:', error);
    if (error instanceof customError_1.CustomError) {
        return res.status(error.statusCode).json({ status: 'error', message: error === null || error === void 0 ? void 0 : error.message });
    }
    else {
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
}
exports.errorHandler = errorHandler;
