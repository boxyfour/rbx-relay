import express from "express";
import { router } from "./routes/router";
import { data_manager } from "../database/DataManager";

const MAXIMUM_TIMEOUT = 100; // seconds

// I don't think there's ever a use case where you want to store old server credentials,
// but you can always omit this line of code if you really want to keep it.
data_manager.flush_database();

const app = express();
const port = 5000;

export function start_server() {
  app.use(express.json());
  app.use(router);

  app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
  });

  // checks if servers are online
  setTimeout(async () => {
    let servers = await data_manager.server_manager.all();

    servers?.forEach((server) => {
      let seconds_since_ping = (Date.now() - server.last_ping) / 1000;

      // Sometimes roblox servers can bug out, so this helps prevent dead servers receiving messages.
      // Could also act as a memory leak(? shouldnt, since we're working with a database but oh well)
      if (seconds_since_ping > MAXIMUM_TIMEOUT) {
        data_manager.server_manager.delete(server.id);
      }
    });
  }, 60 * 1000);
}
