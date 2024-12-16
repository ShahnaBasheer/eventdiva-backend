import VendorRepository from '../repositories/vendor.repository';
import CustomerRepository from '../repositories/customer.repository';
import { BadRequestError } from '../errors/customError';;
import { IVendor} from '../interfaces/vendor.interface';
import { ICustomer } from '../interfaces/customer.interface';
import { UserRole } from '../utils/important-variables';


export default class SharedService{

    constructor(
        private _vendorRepository: VendorRepository,
        private _customerRepository: CustomerRepository,
    ) {}
 
    private getRepositoryByRole(role: UserRole) {
        if (role === UserRole.Vendor) return this._vendorRepository;
        if (role === UserRole.Customer) return this._customerRepository;
        throw new BadRequestError('Invalid role');
    }
    
    async getAllUsers(
        page: number,
        limit: number,
        role: UserRole
      ): Promise<{ users: IVendor[] | ICustomer[]; totalCount: number, totalPages: number }> {
        try {
          const repository = this.getRepositoryByRole(role);
          const skip = (page - 1) * limit;
          let filterQuery: Record<string, any> = {}; // Add your custom filter logic here
      
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
                users : [
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
          const result = await repository.getAggregateData(pipeline) ?? [];
      
          // Extract users and totalCount from the result
          const users = result[0]?.users || [];
          const totalCount = result[0]?.totalCount[0]?.count || 0; // Ensure default value in case it's missing
          const totalPages = Math.ceil(totalCount/ limit);

          return { users, totalCount, totalPages };
        } catch (error) {
          console.error('Error fetching paginated customers:', error);
          throw error;
        }
    }

    
}
