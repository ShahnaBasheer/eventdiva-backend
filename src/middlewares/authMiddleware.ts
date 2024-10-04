import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { ForbiddenError, UnauthorizedError } from "../errors/customError";
import {
  generateNewToken,
  verifyToken,
  isVendorDocument,
} from "../utils/helperFunctions";
import { CustomRequest, CustomSocket } from "../interfaces/request.interface";
import { IcustomerDocument } from "../interfaces/user.interface";
import { IVendorDocument } from "../interfaces/vendor.interface";
import EventPlannerService from "../services/eventPlanner.service";
import VenueVendorService from "../services/venueVendor.service";
import { UserRole, VendorType } from "../utils/important-variables";

const eventPlannerService = new EventPlannerService();
const venueVendorService = new VenueVendorService();

const authMiddleware = asyncHandler(
  async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let role: string | undefined;
    try {
      const authorizationHeader = req.headers?.authorization;
      if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Not authorized: no Bearer");
      }

      const accessToken = authorizationHeader.split(" ")[1];
      if (!accessToken) {
        throw new UnauthorizedError("Not authorized: no access token");
      }

      const decoded = jwt.decode(accessToken) as JwtPayload;
      role = decoded.role;

      const user = await verifyToken(accessToken, role!, 1);
      if (!user) throw new UnauthorizedError("User not found!");

      if ((user as IcustomerDocument | IVendorDocument).isBlocked) {
        let tokenKey =
          role === UserRole.Customer
            ? process.env.CUSTOMER_REFRESH
            : process.env.VENDOR_REFRESH;
        res.clearCookie(tokenKey!);
        throw new ForbiddenError("User account is blocked");
      }

      if (user && role === UserRole.Vendor && isVendorDocument(user)) {
       
        if (user.vendorType === VendorType.EventPlanner) {
          const eventPlanner = await eventPlannerService.getEventPlanner({
            vendorId: user.id,
          });

          if (eventPlanner) {
            user.serviceName = eventPlanner.company;
          }
        } else if (user.vendorType === VendorType.VenueVendor) {
          const venueVendor = await venueVendorService.getVenue({
            vendorId: user.id,
          });
          if (venueVendor) {
            user.serviceName = venueVendor.venueName;
          }
        }
      }
      req.user = user;
      return next();
    } catch (error: any) {
      console.log(error.message, "line 75 authmiddleware");
      let tokenKey;
      if (error instanceof jwt.TokenExpiredError) {
        let refreshToken;

        if (role === UserRole.Admin) {
          tokenKey = process.env.ADMIN_REFRESH;
        } else if (role === UserRole.Customer) {
          tokenKey = process.env.CUSTOMER_REFRESH;
        } else if (role === UserRole.Vendor) {
          tokenKey = process.env.VENDOR_REFRESH;
        }
        refreshToken = req?.cookies[tokenKey!];

        if (!refreshToken && role === UserRole.Customer) return next();
        if (
          !refreshToken &&
          (role === UserRole.Admin || role === UserRole.Vendor)
        ) {
          throw new UnauthorizedError(`Refreshtoken is not found! ${role}`);
        }

        try {
          const user = await verifyToken(refreshToken, role!, 2);
          if (!user) throw new UnauthorizedError("User not found!");

          if ((user as IcustomerDocument | IVendorDocument).isBlocked) {
            throw new ForbiddenError("User account is blocked");
          }

          const token = generateNewToken(user.id!, user.role!);
          console.log("new token has been generated and stored")
          req.user = user;
          req.token = token;
        } catch (error: any) {
          res.clearCookie(tokenKey!);
          if (
            error instanceof ForbiddenError ||
            error instanceof UnauthorizedError
          )
            throw error;
          console.log(error?.message, "session expired");
        }
      } else if (error instanceof ForbiddenError) {
        throw error;
      }
      
      return next();
    }
  }
);

// Check ifCustomer is authorized
const isUser = asyncHandler(
  async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (req?.user) {
      return next();
    }
    throw new UnauthorizedError("Authorization Failed!");
  }
);

// WebSocket Authentication Middleware
const authenticateSocket = async (
  socket: CustomSocket,
  next: (err?: any) => void
) => {
  let role: string | undefined;

  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new UnauthorizedError("Not authorized: no token provided"));
    }

    const decoded = jwt.decode(token) as JwtPayload;
    role = decoded.role;

    const user = await tokenVerify(token, role!, 1);
    socket.user = user; // Attach the user to the socket
    return next();
  } catch (error: any) {
    let tokenKey;
    console.log(error.message, "in authenticateSocket");

    if (error instanceof jwt.TokenExpiredError) {
      // Handle token expiration based on role
      tokenKey =
        role === UserRole.Customer
          ? process.env.CUSTOMER_REFRESH
          : process.env.VENDOR_REFRESH;

      const refreshToken = socket.handshake.headers.cookie
        ?.split("; ")
        .find((cookie) => cookie.startsWith(tokenKey!))
        ?.split("=")[1];
      if (!refreshToken)
        return next(new UnauthorizedError("Refresh token not found!"));

      try {
        const user = await tokenVerify(refreshToken, role!, 2);
        const newToken = generateNewToken(user.id, user.role!);

        socket.user = user;
        console.log("New token generated during socket connection");
        socket.emit("new-token", { token: newToken }); // Emit new token to the client
        return next();
      } catch (refreshError: any) {
        console.log("Unable to refresh token", refreshError?.message);
      }
    } else if (error instanceof ForbiddenError) {
      return next(new ForbiddenError("User account is blocked"));
    } else {
      console.log("Authentication error:", error?.message);
      return next(new UnauthorizedError("Authentication error"));
    }
  }
};

const validateSocketUser = async (socket: CustomSocket) => {
  if (!socket.user) {
    throw new UnauthorizedError("User not authenticated");
  }
  let role = socket.user.role;
  const token = socket.handshake.auth.token || socket.handshake.query.token;

  try {
    const user = await tokenVerify(token, socket.user.role!, 1);
    socket.user = user;
  } catch (error) {
    let tokenKey;
    if (error instanceof jwt.TokenExpiredError) {
      tokenKey =
        role === UserRole.Customer
          ? process.env.CUSTOMER_REFRESH
          : process.env.VENDOR_REFRESH;

      const refreshToken = socket.handshake.headers.cookie
        ?.split("; ")
        .find((cookie) => cookie.startsWith(tokenKey!))
        ?.split("=")[1];
      if (!refreshToken) {
        throw new UnauthorizedError("Refresh token not found!");
      }

      try {
        const user = await tokenVerify(refreshToken, role!, 2);
        socket.user = user;
        const newToken = generateNewToken(user.id!, role!);
        console.log("new token is generated in the socket events");
        socket.emit("new-token", { token: newToken }); // Emit new token if refreshed
        return true;
      } catch (refreshError) {
        throw new UnauthorizedError("Unable to refresh token");
      }
    } else {
      throw new UnauthorizedError("Authentication error");
    }
  }

  return true;
};

async function tokenVerify(token: string, role: string, num: number) {
  const user = await verifyToken(token, role, num);
  if (!user) {
    throw new UnauthorizedError("User not found!");
  }

  if ((user as IcustomerDocument | IVendorDocument).isBlocked) {
    throw new ForbiddenError("User account is blocked");
  }

  return user;
}

export { authMiddleware, isUser, authenticateSocket, validateSocketUser };
