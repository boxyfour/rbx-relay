import { RedisClientType } from "redis";

export type server = {
  player_count: number;
  job_id: string;
  uptime: number; // seconds
  id: string;
  last_ping: number;
};

export class ServerManager {
  client: RedisClientType;

  servers_array: "servers"

  constructor(client: RedisClientType) {
    this.client = client;
  }

  // The key a server's data will be stored under
  server_key(id: string) {
    return `${this.servers_array}:${id}`;
  }

  // Returns a server
  async get(server_id: string): Promise<server | undefined> {
    let server = await this.client.GET(this.server_key(server_id));

    if (!server) {
      console.log("does not exist");
      return;
    }

    return JSON.parse(server);
  }

  // Returns all servers
  async all(): Promise<server[] | undefined> {
    let server_ids = await this.client.SMEMBERS(this.servers_array);

    const serversWithUndefined = await Promise.all(
      server_ids.map((id) => this.get(id)) // shouldnt return nil but oh well
    );

    const servers = serversWithUndefined.filter(
      (s): s is server => s !== undefined
    );

    return servers;
  }

  // Deletes a server
  async delete(server_id: string) {
    await this.client.SREM(this.servers_array, server_id);
    await this.client.DEL(this.server_key(server_id));
  }

  // Updates a server's data
  async update(server: server) {
    server.last_ping = Date.now();
    await this.client.SET(this.server_key(server.id), JSON.stringify(server));
  }

  // Creates a new server
  async add(server: server) {
    // adding serverid to list
    await this.client.SADD(this.servers_array, server.id);

    // storing server data
    await this.client.SET(this.server_key(server.id), JSON.stringify(server));
    console.log("Created db entry:" + `server:${server.id}`);
  }

}