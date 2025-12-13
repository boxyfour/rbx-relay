// Long polling & messages

import { Router } from "express";
import { requireAny } from "../../middleware/auth";
import { data_manager } from "../../../database/DataManager";
import { new_server_action } from "../../../constants/ChannelConstants";

export let router = Router();
export let path = "/servers";

type callback = () => void;
let listeners: callback[] = [];

data_manager.subscriber.subscribe(new_server_action, async () => {

})

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

  let actions = await data_manager.action_manager.server_actions(id);

  if (!actions) {
    return response.status(400).json({
      message: "doesn't exist",
    });
  }

  if (actions && actions.length) {
    data_manager.action_manager.delete_server(id);
    return response.json(actions);
  }

  // prevents a timed-out request from firing
  let is_alive = true;

  const timeout = setTimeout(() => {
    is_alive = false;

    listeners = listeners.filter((cb: callback) => {
      // create new listeners array with only alive callbacks
      return cb !== cb;
    })


    response.json([]);
  }, 30000);


  listeners.push(async () => {
    if (!is_alive) {
      return;
    }

    clearTimeout(timeout);
    let actions = await data_manager.action_manager.server_actions(id);
    await data_manager.action_manager.delete_server(id);
    response.json(actions || []);
  })
});
