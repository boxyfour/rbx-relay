import { Router } from "express";
import { requireAny, requireRoblox } from "../../middleware/auth";
import { data_manager } from "../../../database/DataManager";
import { new_global_action } from "../../../constants/ChannelConstants";


export let router = Router();
export let path = "/servers";

// An array of callbacks waiting for a new global action
type callback = () => void;

let listeners: callback[] = [];

// Runs all listeners
data_manager.subscriber.subscribe(new_global_action, async () => {
  const current = listeners;
  listeners = [];

  for (let listener of current) {
    listener()
  }
});

// Claims a global action
router.post("/global/:id", requireRoblox, async (request, response) => {
  const id = request.params.id;
  let body = request.body;

  if (!data_manager.action_manager.global_action(body.id)) {
    console.log("tried to claim a non-global action");
    return;
  }

  if (!id || !body || !body.id) {
    response.status(401).json({
      message: "missing fields",
    });
    return;
  }

  let success = await data_manager.action_manager.claim_global(body.id);

  return response.status(200).json({
    success: success,
  });
});

// Returns all unclaimed global actoins
router.get("/global/messages", requireAny, async (request, response) => {
  let messages = await data_manager.action_manager.global_actions();

  if (messages && messages.length > 0) {
    return response.status(200).json({
      data: messages,
    });
  }

  // prevents a timed-out request from firing
  let is_alive = true;

  const timeout = setTimeout(() => {
    response.json([]);

    listeners = listeners.filter((cb: callback) => {
      // create new listeners array with only alive callbacks
      return cb !== cb;
    })

    is_alive = false;
  }, 30000);

  // Storing reference so we can remove it from the array later (once it's dead)
  const callback = async () => {
    // If it's been over 30 seconds, make sure to clear the response
    if (!is_alive) {
      return;
    }

    clearTimeout(timeout);
    let actions = await data_manager.action_manager.global_actions();
    response.status(200).json(actions || []);
  }

  listeners.push(callback)
});
