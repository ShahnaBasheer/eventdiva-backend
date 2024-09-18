import { UpdateQuery } from "mongoose";



// base.repository.interface.ts
interface IBaseRepository<T> {
    create(user: T): Promise<T>;
    getAll(filter: any): Promise<T[]>;
    getById(id: string): Promise<T | null>;
    getOneByFilter(filter: any): Promise<T | null>;
    getAllByFilter(filter: any): Promise<T[] | null>;
    getByEmail(email: string): Promise<T | null>;
    update(filter: any, update: UpdateQuery<T>): Promise<T | null>;
    delete(id: string): Promise<T | null>;
    block(id: string): Promise<T | null>;
}

export default IBaseRepository 

