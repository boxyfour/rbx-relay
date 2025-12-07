import { Router } from "express";
import { requireAny, requireRoblox } from "../../middleware/auth";
import { data_manager, message_bus } from "../../store";

export let router = Router();
export let path = "/servers";

// Claims a global action
router.post("/global/:id", requireRoblox, async (request, response) => {
  const id = request.params.id;
  let body = request.body;

  if (!data_manager.global_action(body.id)) {
    console.log("tried to claim a non-global action");
    return;
  }

  if (!id || !body || !body.id) {
    response.status(401).json({
      message: "missing fields",
    });
    return;
  }

  let success = await data_manager.claim_global_action(body.id);

  return response.status(200).json({
    success: success,
  });
});

// Returns all unclaimed global actoins
router.get("/global/messages", requireAny, async (request, response) => {
  let messages = await data_manager.global_actions();

  if (messages && messages.length > 0) {
    return response.status(200).json({
      data: messages,
    });
  }

  // no messages for now
  const timeout = setTimeout(() => {
    message_bus.removeListener(`global`, onMessage);
    response.json([]);
  }, 30000);

  // SOOO much cleaner than whatever the hell polling i was using
  const onMessage = async () => {
    clearTimeout(timeout);
    let actions = await data_manager.global_actions();
    response.status(200).json(actions || []);
  };

  message_bus.once("global", onMessage);
});
