"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.GatewayTimeoutError = exports.ServiceUnavailableError = exports.BadGatewayError = exports.NotImplementedError = exports.TooManyRequestsError = exports.ConflictError = exports.MethodNotAllowedError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.CustomError = void 0;
// errors/CustomError.ts
const http_status_codes_enum_1 = require("../utils/http-status-codes.enum");
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        // Sets the name of the error instance to the name of the class that created it
        // This is helpful for identifying the type of error during error handling.
    }
}
exports.CustomError = CustomError;
class BadRequestError extends CustomError {
    constructor(message) {
        super(message, http_status_codes_enum_1.HttpStatusCodes.BAD_REQUEST); // Used when the client's request is malformed or invalid.
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends CustomError {
    constructor(message) {
        super(message, http_status_codes_enum_1.HttpStatusCodes.UNAUTHORIZED); /* Used when authentication is required and has failed or has
                              not yet been provided. */
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends CustomError {
    constructor(message) {
        super(message, http_status_codes_enum_1.HttpStatusCodes.FORBIDDEN); // Used when the request was valid, but the server is refusing action.
        // The user might not have the necessary permissions.
    }
}
exports.ForbiddenError = ForbiddenError;
class MethodNotAllowedError extends CustomError {
    constructor(message) {
        super(message, http_status_codes_enum_1.HttpStatusCodes.METHOD_NOT_ALLOWED); // Used when a request method is not supported for the requested resource.
    }
}
exports.MethodNotAllowedError = MethodNotAllowedError;
class ConflictError extends CustomError {
    constructor(message) {
        super(message, http_status_codes_enum_1.HttpStatusCodes.CONFLICT); // Used when there is a conflict with the current state of the server, such as a duplicate entry.
    }
}
exports.ConflictError = ConflictError;
class TooManyRequestsError extends CustomError {
    constructor(message) {
        super(message, http_status_codes_enum_1.HttpStatusCodes.TOO_MANY_REQUESTS); // Used when the user has sent too many requests in a given amount of time ("rate limiting").
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
class NotImplementedError extends CustomError {
    constructor(message) {
        super(message, http_status_codes_enum_1.HttpStatusCodes.NOT_IMPLEMENTED); // Used when the server does not recognize the request method,
        // or it lacks the ability to fulfill the request.
    }
}
exports.NotImplementedError = NotImplementedError;
class BadGatewayError extends CustomError {
    constructor(message) {
        super(message, http_status_codes_enum_1.HttpStatusCodes.BAD_GATEWAY); // Used when the server was acting as a gateway or proxy and 
        // received an invalid response from the upstream server.
    }
}
exports.BadGatewayError = BadGatewayError;
class ServiceUnavailableError extends CustomError {
    constructor(message) {
        super(message, http_status_codes_enum_1.HttpStatusCodes.SERVICE_UNAVAILABLE); // Used when the server is currently unavailable (because it is overloaded or down for maintenance).
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
class GatewayTimeoutError extends CustomError {
    constructor(message) {
        super(message, http_status_codes_enum_1.HttpStatusCodes.GATEWAY_TIMEOUT); // Used when the server was acting as a gateway or
        // proxy and did not receive a timely response from the upstream server.
    }
}
exports.GatewayTimeoutError = GatewayTimeoutError;
class NotFoundError extends CustomError {
    constructor(message) {
        super(message, http_status_codes_enum_1.HttpStatusCodes.NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
