"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dependencyContainer_1 = require("../config/dependencyContainer");
class SharedController {
    // Fetch All Event Planners
    constructor(sharedService) {
        this.sharedService = sharedService;
    }
}
exports.default = new SharedController(dependencyContainer_1.sharedService);
