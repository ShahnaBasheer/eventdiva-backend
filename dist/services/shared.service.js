"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const customError_1 = require("../errors/customError");
;
const important_variables_1 = require("../utils/important-variables");
class SharedService {
    constructor(_vendorRepository, _customerRepository) {
        this._vendorRepository = _vendorRepository;
        this._customerRepository = _customerRepository;
    }
    getRepositoryByRole(role) {
        if (role === important_variables_1.UserRole.Vendor)
            return this._vendorRepository;
        if (role === important_variables_1.UserRole.Customer)
            return this._customerRepository;
        throw new customError_1.BadRequestError('Invalid role');
    }
    getAllUsers(page, limit, role) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const repository = this.getRepositoryByRole(role);
                const skip = (page - 1) * limit;
                let filterQuery = {}; // Add your custom filter logic here
                const pipeline = [
                    {
                        $match: filterQuery, // Match your filter query first
                    },
                    {
                        $lookup: {
                            from: 'addresses', // Join with 'addresses' collection
                            localField: 'address',
                            foreignField: '_id',
                            as: 'address',
                        },
                    },
                    {
                        $facet: {
                            users: [
                                { $skip: skip }, // Skip the documents based on the page number
                                { $limit: limit }, // Limit the number of documents returned
                                {
                                    $project: {
                                        firstName: 1,
                                        lastName: 1,
                                        vendorType: 1,
                                        address: 1,
                                        role: 1,
                                        email: 1,
                                        mobile: 1,
                                        isVerified: 1,
                                        isBlocked: 1,
                                        createdAt: 1,
                                    },
                                },
                            ],
                            totalCount: [
                                { $count: 'count' }, // Count total documents matching the query
                            ],
                        },
                    },
                ];
                // Execute the aggregation pipeline
                const result = (_a = yield repository.getAggregateData(pipeline)) !== null && _a !== void 0 ? _a : [];
                // Extract users and totalCount from the result
                const users = ((_b = result[0]) === null || _b === void 0 ? void 0 : _b.users) || [];
                const totalCount = ((_d = (_c = result[0]) === null || _c === void 0 ? void 0 : _c.totalCount[0]) === null || _d === void 0 ? void 0 : _d.count) || 0; // Ensure default value in case it's missing
                const totalPages = Math.ceil(totalCount / limit);
                return { users, totalCount, totalPages };
            }
            catch (error) {
                console.error('Error fetching paginated customers:', error);
                throw error;
            }
        });
    }
}
exports.default = SharedService;
