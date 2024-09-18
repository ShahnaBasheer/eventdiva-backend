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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
class RateLimitRepository {
    constructor() {
        this.redisClient = new ioredis_1.default({
            host: '127.0.0.1', // Ensure this is your Redis server IP
            port: 6379 // Ensure this is your Redis server port
        });
        this.redisClient.on('error', (err) => console.error('Redis Client Error', err));
    }
    incrementAndGet(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield this.redisClient.incr(key);
                return count;
            }
            catch (err) {
                console.error('Error incrementing key:', err);
                throw err;
            }
        });
    }
    setExpiration(key, seconds) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redisClient.expire(key, seconds);
            }
            catch (err) {
                console.error('Error setting expiration:', err);
                throw err;
            }
        });
    }
    quit() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redisClient.quit();
            }
            catch (err) {
                console.error('Error quitting Redis client:', err);
                throw err;
            }
        });
    }
}
exports.default = RateLimitRepository;
// import { createClient, RedisClientType } from 'redis';
// class RateLimitRepository {
//     private readonly redisClient: RedisClientType;
//     constructor() {
//         this.redisClient = createClient();
//         this.redisClient.on('error', (err: any) => console.error('Redis Client Error', err));
//         this.redisClient.connect().catch(console.error);
//     }
//     async incrementAndGet(key: string): Promise<number> {
//         await this.redisClient.incr(key);
//         const count = await this.redisClient.get(key);
//         return Number(count);
//     }
//     async setExpiration(key: string, seconds: number): Promise<void> {
//         await this.redisClient.expire(key, seconds);
//     }
//     async quit(): Promise<void> {
//         await this.redisClient.quit();
//     }
// }
// export default RateLimitRepository;
