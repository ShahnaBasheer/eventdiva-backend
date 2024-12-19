import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import UserService from "../services/user.service";
import { validationResult } from "express-validator";
import { BadRequestError, UnauthorizedError } from "../errors/customError";
import createSuccessResponse from "../utils/responseFormatter";
import { userService } from "../config/dependencyContainer";
import { getRefreshKey } from "../utils/helperFunctions";
import { UserRole } from "../utils/important-variables";
import { CustomRequest } from "../interfaces/request.interface";


class AuthController {
  constructor(private userService: UserService) {}

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Validation failed");
    }

    const data = await this.userService.loginUser(
      email,
      password,
      req.body.role
    );

    const refreshKey = getRefreshKey(req.body.role) || "";

    if (data) {
      res.cookie(refreshKey, data?.refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      });
      createSuccessResponse(
        200,
        { token: data.accessToken, user: data.user },
        `${req.body.role} successfully logged in`,
        res
      );
    }
  });

  signup = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const { firstName, lastName, email, password } = req.body;
    const data: { email: string, password: string, firstName: string, lastName: string, vendorType?: string } 
        = { email, password, firstName, lastName };

    if(req.body.role === UserRole.Vendor){
        data.vendorType = req.body.vendorType;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Validation failed");
    }

    const response = await this.userService.signupUser(data, req.body.role);

    if (response) {
      createSuccessResponse(
        201,
        null,
        `OTP sent successfully to your email address!`,
        res
      );
    }
  });


  logout = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const refreshKey = getRefreshKey(req.user.role) || "";
    const refreshToken = req?.cookies[refreshKey];

    if (!refreshToken) {
      console.log("No refresh token in cookies");
      throw new UnauthorizedError("Something went wrong!");
    }

    // Clear the refresh token cookie
    res.clearCookie(refreshKey);
    createSuccessResponse(200, null, `${req.user.role} successfully logged out!`, res);
  });

  // Google Sign-In
  signinWithGoogle = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { idToken } = req.body;

      const data = await this.userService.verifyWithGoogle(
        idToken,
        req.body.role
      );
      const refreshKey = getRefreshKey(req.body.role) || "";

      if (data) {
        res.cookie(refreshKey , data.refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3 * 24 * 60 * 60 * 1000,
        });
        createSuccessResponse(
          200,
          { token: data.accessToken, user: data.user },
          "Successfully Logged In",
          res
        );
      }
    }
  );

  verifyOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    const isVerified = await this.userService.otpVerification(email, otp, req.body.role);

    if (isVerified) {
      createSuccessResponse(200, null, 'You have successfully signed up! Please Login', res);
    }
  });

  resendOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const result = await this.userService.resendOtp(email, req.body.role);
    const remainingLimit = res.getHeader('X-RateLimit-Remaining');

    if (result) {
      createSuccessResponse(
        201,
        { email, remainingLimit },
        'OTP resent successfully to your email address',
        res
      );
    }
  });
}

export default new AuthController(userService);
