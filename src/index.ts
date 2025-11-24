import { start_server } from "./api";
import { start_bot } from "./bot/bot";

(async () => {
  start_server();
})();
(async () => {
  start_bot();
})();
