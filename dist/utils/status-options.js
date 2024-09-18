"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
var Status;
(function (Status) {
    Status["Pending"] = "pending";
    Status["Paid"] = "paid";
    Status["Approved"] = "approved";
    Status["Rejected"] = "rejected";
    Status["Failed"] = "failed";
    Status["Cancelled"] = "cancelled";
    Status["Refunded"] = "refunded";
    Status["Partially_Refunded"] = "partially-refunded";
    Status["Advance"] = "advance";
    Status["Confirmed"] = "confirmed";
    Status["Completed"] = "completed";
})(Status || (exports.Status = Status = {}));
