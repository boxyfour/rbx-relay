import express from "express";
import { router } from "./routes/router";
import { data_manager } from "./store";

const MAXIMUM_TIMEOUT = 100; // seconds

data_manager.flushall();

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
    let servers = await data_manager.servers();

    servers?.forEach((server) => {
      let seconds_since_ping = (Date.now() - server.last_ping) / 1000;

      if (seconds_since_ping > MAXIMUM_TIMEOUT) {
        data_manager.delete_server(server.id);
      }
    });
  }, 60 * 1000);
}
