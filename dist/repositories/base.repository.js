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
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    create(docItems, populate) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create a new document with the provided data
            const document = new this.model(Object.assign({}, docItems));
            const createdItem = yield this.model.create(document);
            // If the item is not created, throw an error
            if (!createdItem) {
                throw new Error('Failed to create item');
            }
            const populatedItem = populate ? yield createdItem.populate(populate) : createdItem;
            return populatedItem;
        });
    }
    update(filter, update) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOneAndUpdate(Object.assign({}, filter), update, { new: true }).exec();
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedItem = yield this.model.findByIdAndDelete(id).exec();
            if (!deletedItem)
                throw new customError_1.NotFoundError('Notification not found!');
            return deletedItem;
        });
    }
    getAll(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.find(Object.assign({}, filter), { password: 0, googleId: 0, }).exec();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(id).exec();
        });
    }
    getOneByFilter(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne(Object.assign(Object.assign({}, filter), { isDeleted: false, isVerified: true })).exec();
        });
    }
    getAllByFilter(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.find(Object.assign(Object.assign({}, filter), { isDeleted: false })).exec();
        });
    }
    getByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne({ email }).exec();
        });
    }
    getAllVendors(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.find(Object.assign({}, filter)).populate('address').exec();
        });
    }
    getAggregateData(pipeline) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.model.aggregate(pipeline);
                return data;
            }
            catch (error) {
                console.error('Error performing aggregation:', error);
                return null;
            }
        });
    }
    getCount(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.countDocuments(Object.assign({}, filter)).exec();
        });
    }
}
exports.default = BaseRepository;
