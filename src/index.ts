import express from "express";
import { router } from "./routes/router";
import { start_bot } from "./bot/bot";
import { data } from "./store";

data.flushall();

const app = express();
const port = 5000;

app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});

(async () => {
  start_bot();
})();
