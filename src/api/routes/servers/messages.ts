// Long polling & messages

import { Router } from "express";
import { requireAny, requireRoblox, requireWrite } from "../../middleware/auth";
import { data_manager } from "../../store";

export let router = Router();
export let path = "/servers";

// Gets server logs
router.get("/:id/messages", requireAny, async (request, response) => {
  const id = request.params.id;

  if (!id) {
    response.status(401).json({
      message: "missing server id",
    });
    return;
  }

  let actions = data_manager.actions(id);

  if (!actions) {
    return response.status(400).json({
      message: "doesn't exist",
    });
  }

  if (Object.keys(actions).length > 0) {
    let messages = actions;
    data_manager.delete_actions(id);

    response.json(messages);
    return;
  }

  await new Promise<void>((resolve) => {
    const checkInterval = 1000;
    const timeout = 30000;
    let elapsed = 0;

    const interval = setInterval(() => {
      let actions = data_manager.delete_actions(id);

      if (!actions) {
        resolve();
      }

      if (Object.keys(actions).length > 0 || elapsed >= timeout) {
        clearInterval(interval);
        resolve();
      }
      elapsed += checkInterval;
    }, checkInterval);
  });

  let messages = data_manager.actions(id);
  data_manager.delete_actions(id);

  response.json(messages);
});
