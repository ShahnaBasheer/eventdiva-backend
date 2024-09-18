// base.repository.ts
import { Filter } from '../interfaces/utilities.interface';
import IBaseRepository from '../interfaces/baseRepository.interface';
import { Model, UpdateQuery, Document, FilterQuery } from 'mongoose';
import { NotFoundError } from '../errors/customError';




class BaseRepository<T extends Document> implements IBaseRepository<T> {
    private model: Model<T>;
  
    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(docItems: Filter, populate?: { path: string, select?: string, model: string }[] ): Promise<T> {
        // Create a new document with the provided data
        const document = new this.model({ ...docItems });
        console.log(document)
        const createdItem = await this.model.create(document);
    
        // If the item is not created, throw an error
        if (!createdItem) {
            throw new Error('Failed to create item');
        }

        const populatedItem = populate ? await createdItem.populate(populate) : createdItem;
        return populatedItem;
    }
  
    async update(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
        return await this.model.findOneAndUpdate({...filter}, update, { new: true }).exec();
    }
  
    async delete(id: string): Promise<T | null> {
        const deletedItem = await this.model.findByIdAndDelete(id).exec();
        if (!deletedItem)throw new NotFoundError('Notification not found!');
        return deletedItem;
    }
  
    async getAll(filter: FilterQuery<T>): Promise<T[]> {
        return await this.model.find({...filter},{ password: 0, googleId: 0, }).exec();
    }

    async getAllWithPopuate(filter: FilterQuery<T>): Promise<T[]> {
        return await this.model.find({...filter},{ password: 0, googleId: 0, }).populate('address').exec();
    }
  
    async getById(id: string): Promise<T | null> {
        return await this.model.findById(id).exec();
    }
    
    async getOneByFilter(filter: FilterQuery<T>): Promise<T | null> {
        console.log(filter,"herw", await this.model.findOne({ ...filter, isDeleted: false, isVerified: true }).exec())
        return await this.model.findOne({ ...filter, isDeleted: false, isVerified: true }).exec();
    }

    async getAllByFilter(filter: FilterQuery<T>): Promise<T[] | null> {
        return await this.model.find({ ...filter, isDeleted: false }).exec();
    }
    

    async getByEmail(email: string): Promise<T | null> {
        return this.model.findOne({ email }).exec();
    }

    async block(id: string): Promise<T | null>{
        return this.model.findByIdAndUpdate(id,{isBlocked : true},{new:true})
    }

    async unblock(id: string): Promise<T | null>{
        return this.model.findByIdAndUpdate(id,{isBlocked : false},{new:true})
    }

    async getAllVendors(filter: FilterQuery<T>): Promise<T [] | null> {
        return await this.model.find({ ...filter }).populate('address').exec();
    } 
}

export default BaseRepository;
