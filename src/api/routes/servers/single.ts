// Single server operations

import { Router } from "express";
import { requireAny, requireRoblox } from "../../middleware/auth";
import { data_manager } from "../../../database/DataManager";
import { server } from "../../../database/ServerManager";


export let router = Router();
export let path = "/servers";

// TODO:
// * Servers can patch eachother's data
// * Could be a security issue? Should be-
// * -impossible if uuid's aren't leaked though
router.patch("/:id", requireRoblox, async (request, response) => {
  let id = request.params.id;
  let body: Partial<server> = request.body;

  if (!id) {
    response.status(400).json({
      message: "missing server id",
    });
    return;
  }

  let cached_data = await data_manager.server_manager.get(id);

  if (!cached_data) {
    response.status(400).json({
      message:
        "cached data doesnt exist (when getting server data, something failed)",
    });
    return;
  }

  const updated = {
    ...cached_data,
    ...body,
  };

  data_manager.server_manager.update(updated);

  response.status(200).json(updated);
});

// Deletes a server
router.delete("/:id", requireAny, async (request, response) => {
  let id = request.params.id;

  if (!(await data_manager.server_manager.get(id))) {
    response.status(400).json({
      message: `server with id ${id} does not exist`,
    });
    return;
  }

  data_manager.server_manager.delete(id);
  response.sendStatus(200);
});
