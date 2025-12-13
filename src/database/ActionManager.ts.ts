import { RedisClientType } from "redis";
import { SUCCESS } from "../constants/RedisConstants";
import uuid from "uuid";

type action = {
    topic: string;
    arguments: Record<number, any>;
    taken?: boolean;
    id?: string;
};

const global_array = "global-actions";
const server_array = "server-actions";

// Action are stored under:
// global-actions -- an array of action ids
// global-actions:id -- a global action
// global actions can have a :taken field

// server-actions:id -- an array of server actions
// Server actoins are stored as plain json, because there are no ids to identify them (and its simpler to implement)
export class ActionManager {
    client: RedisClientType;

    constructor(client: RedisClientType) {
        this.client = client;
    }
    server_key(id: string) {
        return `${server_array}:${id}`
    }

    global_key(global_id: string) {
        return `${global_array}:${global_id}`
    }

    async delete_server(server_id: string) {
        return await this.client.DEL(this.server_key(server_id))
    }

    async server_actions(server_id: string): Promise<action[] | undefined> {
        // Returns an array of JSON strings located at the server's id
        let actions: string[] = await this.client.SMEMBERS(this.server_key(server_id));
        let actions_mapped: action[] = actions.map((value) => {
            return JSON.parse(value);
        });

        return actions_mapped;
    }

    async delete_global(global_action: string) {
        let global_key = this.global_key(global_action);

        await this.client.del(global_key);
        await this.client.del(`${global_key}:taken`);
    }

    async global_action(id: string) {
        let un_parsed = await this.client.GET(this.global_key(id));

        if (!un_parsed) {
            return;
        }

        return JSON.parse(un_parsed);
    }

    async global_actions() {
        let actions: string[] = await this.client.SMEMBERS(global_array);

        if (actions.length < 0) {
            return [];
        }

        let actions_mapped: action[] = await Promise.all(
            actions.map(async (global_key) => {
                return this.global_action(global_key);
            })
        );

        return actions_mapped;
    }

    async add(server_id: string, action: action) {
        let success =
            (await this.client.SADD(this.server_key(server_id), JSON.stringify(action))) ==
            SUCCESS;

        return success;
    }

    async add_global(action: Partial<action>) {
        action.id = uuid.v6();
        action.taken = false;
        await this.client.SADD(global_array, action.id);
        await this.client.SET(this.global_key(action.id), JSON.stringify(action));
    }

    async claim_global(action_id: string): Promise<boolean> {
        let taken = await this.client.setNX(
            `${this.global_key(action_id)}:taken`,
            JSON.stringify(true)
        );

        if (taken == SUCCESS) {
            await this.delete_global(action_id);
        }

        return taken == SUCCESS;
    }
}