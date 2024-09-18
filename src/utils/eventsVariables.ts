


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
]


enum NotificationType {
    MESSAGE = 'new_message',
    MISSED_CALL = 'missed_call',
    REJECTED_CALL = 'rejected_call',
    SIGNUP = 'signup',
    BOOKING_CONFIRMATION = 'booking_confirmation',
    BOOKING_UPDATE = 'booking_update',
    BOOKING_PLACED = 'booking_placed',
    BOOKING_CANCELLATION = 'booking_cancellation',
    BOOKING_REMINDER = 'booking_reminder',
    PAYMENT_SUCCESSFUL = 'payment_successful',
    PAYMENT_FAILED = 'payment_failed',
    REFUND_ISSUED = 'refund_issued',
    VENDOR_APPROVAL = 'vendor_approval',
    VENDOR_REJECTION = 'vendor_rejection',
    NEW_BOOKING_REQUEST = 'new_booking_request',
    SYSTEM_MAINTENANCE = 'system_maintenance',
    NEW_FEATURES = 'new_features',
    ACCOUNT_UPDATE = 'account_update',
    SERVICE_REGISTERED = 'service_registered',
    ADVANCE_PAYMENT = 'advance_payment',
    FULL_PAYMENT = 'full_payment',
}


export {
    eventOptions,
    notificationTypes,
    NotificationType
}