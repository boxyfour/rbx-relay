// Single server operations

import { Router } from "express";
import { requireAny, requireRoblox, requireWrite } from "../../middleware/auth";
import { server, data_manager } from "../../store";

export let router = Router();
export let path = "/servers";

// Updates server details
router.patch("/:id", requireRoblox, async (request, response) => {
  let id = request.params.id;
  let body: Partial<server> = request.body;

  if (!id) {
    response.status(400).json({
      message: "missing server id",
    });
    return;
  }

  let cached_data = await data_manager.server(id);

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

  data_manager.update_server(updated);

  response.status(200).json(updated);
});

// Deletes a server
router.delete("/:id", requireAny, async (request, response) => {
  let id = request.params.id;

  if (!(await data_manager.server(id))) {
    response.status(400).json({
      message: `server with id ${id} does not exist`,
    });
    return;
  }

  data_manager.delete_server(id);
  response.sendStatus(200);
});
