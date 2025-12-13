// Returns all actions, all erv

import { Router } from "express";
import { requireRoblox, requireWrite } from "../../middleware/auth";
import { v6 } from "uuid";
import { data_manager } from "../../../database/DataManager";
import { server } from "../../../database/ServerManager";

export let router = Router();
export let path = "/servers";

router.get("/", requireWrite, async (request, response) => {
  response.json(await data_manager.server_manager.all());
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
  data_manager.server_manager.add(body);

  console.log(`registered id: ${body.id}`);

  response.json({
    id: body.id,
  });
});
