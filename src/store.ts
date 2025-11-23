import { createClient, RedisClientType } from "redis";
import { v6 } from "uuid";

const SUCCESS = 1;
const FAILURE = 0;

export type server = {
  player_count: number;
  job_id: string;
  uptime: number; // seconds
  id: string;
};

type ban_unit = "days" | "seconds" | "weeks" | "years" | "hours";

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
    console.log(`getting server: server:${server_id}`);
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
    console.log(await this.server(server.id));
    await this.client.SET(`server:${server.id}`, JSON.stringify(server));
    console.log(await this.server(server.id));
  }

  async add_server(server: server) {
    // adding serverid to list
    await this.client.SADD("servers", server.id);

    // storing server data
    await this.client.SET(`server:${server.id}`, JSON.stringify(server));
    console.log("Created db entry:" + `server:${server.id}`);
    console.log(await this.client.GET(`server:${server.id}`));
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

  async global_actions() {
    let actions: string[] = await this.client.SMEMBERS(`global`);
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
    return (
      (await this.client.SADD(`server:${server_id}`, JSON.stringify(action))) ==
      SUCCESS
    );
  }

  async add_global_action(action: action) {
    if (!action.id) {
      console.error("Tried adding a global action without an id");
      return false;
    }

    await this.client.set(`global:${action.id}`, JSON.stringify(action));
  }

  async claim_global_action(action_id: string): Promise<boolean> {
    let taken = await this.client.setNX(
      `global:${action_id}:taken`,
      JSON.stringify(true)
    );

    return taken == SUCCESS;
  }
}

export let global: action[] = [];
export let incoming: Record<string, action[]> = {};
export let servers: Record<string, server> = {};

// todo: validate args
export let data = new DataManager();
