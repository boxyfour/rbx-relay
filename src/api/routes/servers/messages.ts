// Long polling & messages

import { Router } from "express";
import { requireAny } from "../../middleware/auth";
import { data_manager, message_bus } from "../../store";

export let router = Router();
export let path = "/servers";

// Gets server logs
// TODO:
// * Servers can access eachother's messages.
// * Might be a no-go
router.get("/:id/messages", requireAny, async (request, response) => {
  const id = request.params.id;

  if (!id) {
    response.status(401).json({
      message: "missing server id",
    });
    return;
  }

  let actions = await data_manager.actions(id);

  if (!actions) {
    return response.status(400).json({
      message: "doesn't exist",
    });
  }

  if (actions && actions.length) {
    data_manager.delete_actions(id);
    return response.json(actions);
  }

  // no messages for now
  const timeout = setTimeout(() => {
    message_bus.removeListener(`server:${id}`, onMessage);
    response.json([]);
  }, 30000);

  // SOOO much cleaner than whatever the hell polling i was using
  const onMessage = async () => {
    clearTimeout(timeout);
    let actions = await data_manager.actions(id);
    await data_manager.delete_actions(id);
    response.json(actions || []);
  };

  message_bus.once(`server:${id}`, onMessage);
});
