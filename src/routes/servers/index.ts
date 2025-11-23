// Returns all actions, all erv

import { Router } from "express";
import { requireRoblox } from "../../middleware/auth";
import { data, server } from "../../store";

let base_id: number = 0;

export let router = Router();
export let path = "/servers";

// Gets servers
router.get("/", async (request, response) => {
  response.json(await data.servers());
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

  base_id += 1;
  let id = base_id;

  console.log(body);
  body.id = id.toString();
  data.add_server(body);

  console.log(`registered id: ${id}`);

  response.json({
    id: id,
  });
});
