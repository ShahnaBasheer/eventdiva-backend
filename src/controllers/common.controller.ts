import asyncHandler from 'express-async-handler';
import { Response } from "express";
import { eventPlannerService, sharedService, venueVendorService } from "../config/dependencyContainer";
import SharedService from "../services/shared.service";
import VenueVendorService from '../services/venueVendor.service';
import createSuccessResponse from '../utils/responseFormatter';
import { NotFoundError } from '../errors/customError';
import { generateServiceFilter } from '../utils/helperFunctions';
import { CustomRequest } from '../interfaces/request.interface';
import EventPlannerService from '../services/eventPlanner.service';

class CommonController {
    // Fetch All Event Planners
    constructor(
        private sharedService: SharedService,
        private venueVendorService: VenueVendorService,
        private eventPlannerService: EventPlannerService
    ){}
    

    getVenue = asyncHandler(
        async (req: CustomRequest, res: Response): Promise<void> => {
          const filter = generateServiceFilter(req.user, req.params?.slug)
          const venueData = await  this.venueVendorService.getVenue(filter);
          if (!venueData) {
            throw new NotFoundError("Venue not found");
          }
          createSuccessResponse(200, { venueData }, 'Successfull', res, req);
        }
    );

    getEventPlanner = asyncHandler(
      async (req: CustomRequest, res: Response): Promise<void> => {
        const filter = generateServiceFilter(req.user, req.params?.slug)
        const eventPlannerData = await this.eventPlannerService.getEventPlanner(filter);
        if (!eventPlannerData) {
          throw new NotFoundError("Event planner not found");
        }
        createSuccessResponse(200, { eventPlannerData }, "successfull", res, req);
      }
    );
}

export default new CommonController(sharedService, venueVendorService, eventPlannerService);
