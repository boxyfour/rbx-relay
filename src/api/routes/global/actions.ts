import { Router } from "express";
import { requireAny, requireRoblox, requireWrite } from "../../middleware/auth";
import { data_manager } from "../../store";

export let router = Router();
export let path = "/servers";

// Claims logs
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

  console.log(success);

  return response.status(200).json({
    success: success,
  });
});

router.get("/global", async (request, response) => {
  console.log("got request");

  return response.status(200).json({
    data: await data_manager.global_actions(),
  });
});
