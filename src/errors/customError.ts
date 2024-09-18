// errors/CustomError.ts
import { HttpStatusCodes } from '../utils/http-status-codes.enum';


class CustomError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message);
        this.name = this.constructor.name;
        // Sets the name of the error instance to the name of the class that created it
        // This is helpful for identifying the type of error during error handling.
    }
}

class BadRequestError extends CustomError {
    constructor(message: string) {
        super(message, HttpStatusCodes.BAD_REQUEST); // Used when the client's request is malformed or invalid.
    }
}

class UnauthorizedError extends CustomError {
    constructor(message: string) {
        super(message, HttpStatusCodes.UNAUTHORIZED); /* Used when authentication is required and has failed or has 
                              not yet been provided. */
    }
}

class ForbiddenError extends CustomError {
    constructor(message: string) {
        super(message, HttpStatusCodes.FORBIDDEN); // Used when the request was valid, but the server is refusing action.
                                                  // The user might not have the necessary permissions.
    }
}

class MethodNotAllowedError extends CustomError {
    constructor(message: string) {
        super(message, HttpStatusCodes.METHOD_NOT_ALLOWED); // Used when a request method is not supported for the requested resource.
    }
}

class ConflictError extends CustomError {
    constructor(message: string) {
        super(message, HttpStatusCodes.CONFLICT); // Used when there is a conflict with the current state of the server, such as a duplicate entry.
    }
}

class TooManyRequestsError extends CustomError {
    constructor(message: string) {
        super(message, HttpStatusCodes.TOO_MANY_REQUESTS); // Used when the user has sent too many requests in a given amount of time ("rate limiting").
    }
}

class NotImplementedError extends CustomError {
    constructor(message: string) {
        super(message, HttpStatusCodes.NOT_IMPLEMENTED); // Used when the server does not recognize the request method,
                                                        // or it lacks the ability to fulfill the request.
    }
}

class BadGatewayError extends CustomError {
    constructor(message: string) {
        super(message, HttpStatusCodes.BAD_GATEWAY); // Used when the server was acting as a gateway or proxy and 
                                                    // received an invalid response from the upstream server.
    }
}

class ServiceUnavailableError extends CustomError {
    constructor(message: string) {
        super(message, HttpStatusCodes.SERVICE_UNAVAILABLE); // Used when the server is currently unavailable (because it is overloaded or down for maintenance).
    }
}

class GatewayTimeoutError extends CustomError {
    constructor(message: string) {
        super(message, HttpStatusCodes.GATEWAY_TIMEOUT); // Used when the server was acting as a gateway or
                                                        // proxy and did not receive a timely response from the upstream server.
    }
}


class NotFoundError extends CustomError {
    constructor(message: string) {
        super(message, HttpStatusCodes.NOT_FOUND); 
    }
}


export {
    CustomError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    MethodNotAllowedError,
    ConflictError,
    TooManyRequestsError,
    NotImplementedError,
    BadGatewayError,
    ServiceUnavailableError,
    GatewayTimeoutError,
    NotFoundError
};
