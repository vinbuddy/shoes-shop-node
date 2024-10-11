import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = {};

export const handleEventConnection = (redisConnection) => {
    redisConnection.on("connect", () => {
        console.log("Redis - Connection status: connected 🚀");
    });
    redisConnection.on("end", () => {
        console.log("Redis - Connection status: disconnected");
    });
    redisConnection.on("reconnecting", () => {
        console.log("Redis - Connection status: reconnecting");
    });
    redisConnection.on("error", () => {
        console.log("Redis - Connection status: error");
    });
};

export const connectToRedis = async () => {
    const host = process.env.REDIS_HOST;
    const password = process.env.REDIS_PASSWORD;
    const port = process.env.REDIS_PORT;

    const redisInstance = createClient({ url: `redis://${host}:${port}`, password });

    redisClient.redisInstance = redisInstance;

    handleEventConnection(redisInstance);

    try {
        await redisInstance.connect();
    } catch (error) {
        console.log("Redis - Connection error: ", error.message);
    }
};

export const getRedis = () => redisClient.redisInstance;
export default redisClient;
