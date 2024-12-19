import asyncHandler from 'express-async-handler';
import { Response } from "express";
import { chatroomservice, eventPlannerService, notificationService, venueVendorService } from "../config/dependencyContainer";
import VenueVendorService from '../services/venueVendor.service';
import createSuccessResponse from '../utils/responseFormatter';
import { BadRequestError, NotFoundError } from '../errors/customError';
import { generateServiceFilter } from '../utils/helperFunctions';
import { CustomRequest } from '../interfaces/request.interface';
import EventPlannerService from '../services/eventPlanner.service';
import ChatRoomService from '../services/chatRoom.service';
import NotificationService from '../services/notification.service';

class CommonController {
    // Fetch All Event Planners
    constructor(
        private venueVendorService: VenueVendorService,
        private eventPlannerService: EventPlannerService,
        private chatroomService: ChatRoomService,
        private notificationService: NotificationService
    ){}
    

    getVenue = asyncHandler(
        async (req: CustomRequest, res: Response): Promise<void> => {
          const filter = generateServiceFilter(req.user ?? { role: req.body.role}, req.params?.slug)
          const venueData = await  this.venueVendorService.getVenue(filter);
          if (!venueData) {
            throw new NotFoundError("Venue not found");
          }
          createSuccessResponse(200, { venueData }, 'Successfull', res, req);
        }
    );

    getEventPlanner = asyncHandler(
      async (req: CustomRequest, res: Response): Promise<void> => {
        const filter = generateServiceFilter(req.user ?? { role: req.body.role}, req.params?.slug)
        const eventPlannerData = await this.eventPlannerService.getEventPlanner(filter);
        if (!eventPlannerData) {
          throw new NotFoundError("Event planner not found");
        }
        createSuccessResponse(200, { eventPlannerData }, "successfull", res, req);
      }
    );

    markMessageRead = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
      const { messageIds, roomId } = req.body;
      if (!Array.isArray(messageIds)) throw new BadRequestError('Invalid request. Provide messageIds array');
      const message = await this.chatroomService.markMessagesAsRead(messageIds, roomId);
      createSuccessResponse(200, { message }, `Message ${messageIds} in chatroom ${roomId} marked as read.`, res, req);
    });

    notificationReadStatus = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
       const notification = await this.notificationService.updateReadStatus(req.body.id);
       createSuccessResponse(200, { notification }, 'Read status updated successfully', res, req);
    });

    deleteNotification = asyncHandler(
      async (req: CustomRequest, res: Response): Promise<void> => {
        const notification = await this.notificationService.deleteNotification(req.params.id
        );
        createSuccessResponse(200, { notification }, 'Notification deleted successfully', res, req);
      }
    );

    getNotifications = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
      const data = await this.notificationService.getNotifications(req.user.id, req.user.role);
      createSuccessResponse(
        200,
        { notifications: data.notifications, readCount: data.readCount },
        'Successfully retrieved notifications',
        res,
        req
      );
    });
}

export default new CommonController( venueVendorService, eventPlannerService, chatroomservice, notificationService);
