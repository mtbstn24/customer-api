import { CustomerInterface } from "../models/customer";
import { redisClient } from "../services/cache.service";

export async function setCache(key: string, data: Object) {
    try {
        await redisClient.set(key, JSON.stringify(data));
        console.log("Customer detail cached successfully");
    } catch (error) {
        console.error('Error caching: ', error);
    }
}

export async function getCache(key: string) {
    console.log("Trying to retieve from cache...");
    try {
        const cacheData = await redisClient.get(key);
        if (cacheData) {
            console.log("Customer detail retrieved from cache successfully");
        } else {
            console.log("Customer detail does not exist in cache");
        }
        return cacheData ? JSON.parse(cacheData) : null;
    } catch (error) {
        console.error('Error getting cache: ', error);
    }
}

export async function delCache(key: string) {
    console.log("Trying to delete record from cache...");
    try {
        const cacheResult = await redisClient.del(key);
        console.log("Deleted cache records: ", cacheResult);
    } catch (error) {
        console.log('Error deleting cache: ', error);
    }
}

export async function getAllCache() {
    console.log("Trying to retieve from cache...");
    let allCacheData: CustomerInterface[] = [];
    try {
        const keys = await redisClient.keys('[A-Z][0-9][0-9][0-9][0-9]');

        const redisGetPromises = keys.map(async (key) => {
            const cacheResult = await redisClient.get(key);
            const data = cacheResult ? JSON.parse(cacheResult) : {};
            return data;
        });

        allCacheData = await Promise.all(redisGetPromises);

        if (allCacheData) {
            console.log("Customer details retrieved from cache successfully");
        } else {
            console.log("Customer details does not exist in cache");
        }

        return allCacheData || [];

    } catch (error) {
        console.error('Error getting cache: ', error);
    }
}