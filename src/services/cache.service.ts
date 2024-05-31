import { createClient } from "redis";

//creates a redis client connection to localhost on port 6379.
export const redisClient = createClient()
    .on('error', err => console.log('Redis client error', err));

export const redisConnect = async () => {
    await redisClient.connect();
}
