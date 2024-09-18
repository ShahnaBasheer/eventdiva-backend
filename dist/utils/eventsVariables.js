"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.notificationTypes = exports.eventOptions = void 0;
const eventOptions = [
    "Wedding Events",
    "Corporate Events",
    "Social Events",
    "Themed Parties",
    "Destination Events",
    "Festivals",
    "Concerts and Live Performances",
    "Trade Shows and Exhibitions",
    "Fundraisers and Charity Events",
    "Conferences and Seminars",
    "Product Launches",
    "Award Ceremonies",
    "Birthday Parties",
    "Anniversaries",
    "Sporting Events",
    "Community Events",
    "School and University Events",
    "Religious Celebrations",
    "Holiday Parties",
    "General Event Planning",
];
exports.eventOptions = eventOptions;
const notificationTypes = [
    'message',
    'missed_call',
    'signup',
    'booking_confirmation',
    'booking_update',
    'booking_place',
    'booking_cancellation',
    'booking_reminder',
    'payment_successful',
    'payment_failed',
    'refund_issued',
    'vendor_approval',
    'vendor_rejection',
    'new_booking_request',
    'system_maintenance',
    'new_features',
    'account_update',
    'service_registered',
    'advance_payment',
    'new_message'
];
exports.notificationTypes = notificationTypes;
var NotificationType;
(function (NotificationType) {
    NotificationType["MESSAGE"] = "new_message";
    NotificationType["MISSED_CALL"] = "missed_call";
    NotificationType["REJECTED_CALL"] = "rejected_call";
    NotificationType["SIGNUP"] = "signup";
    NotificationType["BOOKING_CONFIRMATION"] = "booking_confirmation";
    NotificationType["BOOKING_UPDATE"] = "booking_update";
    NotificationType["BOOKING_PLACED"] = "booking_placed";
    NotificationType["BOOKING_CANCELLATION"] = "booking_cancellation";
    NotificationType["BOOKING_REMINDER"] = "booking_reminder";
    NotificationType["PAYMENT_SUCCESSFUL"] = "payment_successful";
    NotificationType["PAYMENT_FAILED"] = "payment_failed";
    NotificationType["REFUND_ISSUED"] = "refund_issued";
    NotificationType["VENDOR_APPROVAL"] = "vendor_approval";
    NotificationType["VENDOR_REJECTION"] = "vendor_rejection";
    NotificationType["NEW_BOOKING_REQUEST"] = "new_booking_request";
    NotificationType["SYSTEM_MAINTENANCE"] = "system_maintenance";
    NotificationType["NEW_FEATURES"] = "new_features";
    NotificationType["ACCOUNT_UPDATE"] = "account_update";
    NotificationType["SERVICE_REGISTERED"] = "service_registered";
    NotificationType["ADVANCE_PAYMENT"] = "advance_payment";
    NotificationType["FULL_PAYMENT"] = "full_payment";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
