// Returns all actions, all erv

import { Router } from "express";
import { requireRoblox, requireWrite } from "../../middleware/auth";
import { data_manager, server } from "../../store";
import { v6 } from "uuid";

let base_id: number = 0;

export let router = Router();
export let path = "/servers";

router.get("/", requireWrite, async (request, response) => {
  response.json(await data_manager.servers());
});

// Creates server
router.post("/", requireRoblox, (request, response) => {
  let body: server | undefined = request.body;

  if (!body) {
    response.status(400).json({
      message: "missing server details",
    });
    return;
  }

  if (!body.id) {
    body.id = v6();
  }

  body.last_ping = Date.now();
  data_manager.add_server(body);

  console.log(`registered id: ${body.id}`);

  response.json({
    id: body.id,
  });
});
