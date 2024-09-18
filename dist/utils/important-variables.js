"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["Admin"] = "admin";
    UserRole["Vendor"] = "vendor";
    UserRole["Customer"] = "customer";
})(UserRole || (exports.UserRole = UserRole = {}));
var VendorType;
(function (VendorType) {
    VendorType["EventPlanner"] = "event-planner";
    VendorType["VenueVendor"] = "venue-vendor";
})(VendorType || (exports.VendorType = VendorType = {}));
