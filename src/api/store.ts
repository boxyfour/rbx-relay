import { createClient, RedisClientType } from "redis";
import { v6 } from "uuid";
import { EventEmitter } from "node:events";

// ? Redis returns an integer instead of a boolean to
// ? indicate an actions success. This just helps
// ? maintain readability
const SUCCESS = 1;

export let message_bus = new EventEmitter();

export type server = {
  player_count: number;
  job_id: string;
  uptime: number; // seconds
  id: string;
  last_ping: number;
};

export type action = {
  topic: string;
  arguments: Record<number, any>;
  taken?: boolean;
  id: string;
};

class DataManager {
  client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: "redis://localhost",
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on("error", (err: Error) => {
      console.error("Redis connection error:", err);
    });

    this.connectRedis().catch(console.error);
    this.claim_global_action("asd");
  }

  async flushall() {
    await this.client.flushAll();
  }

  async connectRedis(): Promise<void> {
    await this.client.connect();
  }

  async server(server_id: string): Promise<server | undefined> {
    let server = await this.client.GET(`server:${server_id}`);
    if (!server) {
      console.log("does not exist");
      return;
    }

    return JSON.parse(server);
  }

  async servers(): Promise<server[] | undefined> {
    let server_ids = await this.client.SMEMBERS("servers");

    const serversWithUndefined = await Promise.all(
      server_ids.map((id) => this.server(id)) // shouldnt return nil but oh well
    );

    const servers = serversWithUndefined.filter(
      (s): s is server => s !== undefined
    );

    return servers;
  }

  async delete_server(server_id: string) {
    await this.client.SREM("servers", server_id);
    await this.client.del(`servers:${server_id}`);
    await this.delete_actions(server_id);
  }

  async update_server(server: server) {
    server.last_ping = Date.now();
    await this.client.SET(`server:${server.id}`, JSON.stringify(server));
  }

  async add_server(server: server) {
    // adding serverid to list
    await this.client.SADD("servers", server.id);

    // storing server data
    await this.client.SET(`server:${server.id}`, JSON.stringify(server));
    console.log("Created db entry:" + `server:${server.id}`);
  }

  async actions(server_id: string): Promise<action[] | undefined> {
    let actions: string[] = await this.client.SMEMBERS(`servers:${server_id}`);
    let actions_mapped: action[] = actions.map((value) => {
      return JSON.parse(value);
    });

    return actions_mapped;
  }

  async delete_actions(server_id: string) {
    await this.client.del(`servers:${server_id}`);
  }
  async delete_global_action(server_id: string) {
    await this.client.del(`global:${server_id}`);
    await this.client.del(`global:${server_id}:taken`);
  }

  async global_action(action_id: string) {
    return await this.client.GET(`global:${action_id}`);
  }

  async global_actions() {
    let actions: string[] = await this.client.SMEMBERS(`global`);

    if (actions.length < 0) {
      return [];
    }

    let actions_mapped: action[] = await Promise.all(
      actions.map(async (global_key) => {
        let global_action = await this.client.GET(`global:${global_key}`);

        if (!global_action) {
          return;
        }

        return JSON.parse(global_action);
      })
    );

    return actions_mapped;
  }

  async add_action(server_id: string, action: action) {
    let success =
      (await this.client.SADD(`server:${server_id}`, JSON.stringify(action))) ==
      SUCCESS;

    if (success) {
      message_bus.emit(`server:${server_id}`, action);
    }

    return success;
  }

  async add_global_action(action: Partial<action>) {
    action.id = v6();
    action.taken = false;
    await this.client.SADD("global", action.id);
    await this.client.SET(`global:${action.id}`, JSON.stringify(action));

    // I might've forgotten to add long-polling for global messages.. smh
    message_bus.emit(`global`, action);
  }

  async claim_global_action(action_id: string): Promise<boolean> {
    let taken = await this.client.setNX(
      `global:${action_id}:taken`,
      JSON.stringify(true)
    );

    if (taken == SUCCESS) {
      await this.delete_global_action(action_id);
    }

    return taken == SUCCESS;
  }
}

export let global: action[] = [];
export let incoming: Record<string, action[]> = {};
export let servers: Record<string, server> = {};

// todo: validate args
export let data_manager = new DataManager();
