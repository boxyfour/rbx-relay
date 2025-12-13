import { createClient, RedisClientType } from "redis";
import { ActionManager } from "./ActionManager.ts.js";
import { ServerManager } from "./ServerManager.js";

class DataManager {
    client: RedisClientType;
    action_manager: ActionManager;
    server_manager: ServerManager;

    publisher: RedisClientType;
    subscriber: RedisClientType;


    constructor() {
        this.publisher = createClient({
            url: "redis://localhost",
            password: process.env.REDIS_PASSWORD
        });
        this.subscriber = createClient({
            url: "redis://localhost",
            password: process.env.REDIS_PASSWORD
        });
        this.client = createClient({
            url: "redis://localhost",
            password: process.env.REDIS_PASSWORD,

        });

        this.client.connect();
        this.subscriber.connect();
        this.publisher.connect();

        const oldSend = this.client.sendCommand.bind(this.client);
        this.client.sendCommand = (args) => {
            console.error("Redis Command:", args);
            args.forEach((a, i) => {
                if (a === undefined) {
                    console.error("❌ Undefined Redis argument at index", i, "args:", args);
                    throw new Error("Undefined Redis argument detected");
                }
            });
            return oldSend(args);
        };

        this.action_manager = new ActionManager(this.client);
        this.server_manager = new ServerManager(this.client);



    }

    flush_database() {
        this.client.flushAll();
    }
}

export const data_manager = new DataManager()