import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/customError';



function notFoundHandler(req: Request, res: Response) {
    return res.status(404).json({status: 'not-found', message: `Not Found: ${req.originalUrl}` });
}



function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
    console.log('An error occurred:', error);

    if (error instanceof CustomError) {
        return res.status(error.statusCode).json({status: 'error', message: error?.message });
    } else {
        return res.status(500).json({status: 'error', message: 'Internal Server Error' });
    }
}

export { errorHandler, notFoundHandler}