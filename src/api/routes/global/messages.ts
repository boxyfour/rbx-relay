// Long polling & messages

import { Router } from "express";
import { data_manager } from "../../store";

export let router = Router();
export let path = "/servers/global";

// Gets global actions
router.get("/messages", async (req, res) => {
  const checkInterval = 100;
  const timeout = 30000;
  let elapsed = 0;

  let actions = await data_manager.global_actions();
  if (actions.length > 0) {
    return res.json({ data: actions });
  }

  await new Promise<void>((resolve) => {
    const interval = setInterval(async () => {
      elapsed += checkInterval;
      const actions = await data_manager.global_actions();

      if (actions.length > 0 || elapsed >= timeout) {
        clearInterval(interval);
        resolve();
      }
    }, checkInterval);
  });

  res.json({ data: await data_manager.global_actions() });
});
