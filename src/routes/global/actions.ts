import { Router } from "express";
import { requireAny, requireRoblox, requireWrite } from "../../middleware/auth";
import { data } from "../../store";

export let router = Router();
export let url = "/actions/";

// Claims logs
router.post("/global/:id", requireRoblox, async (request, response) => {
  const id = request.params.id;
  let body = request.body;

  if (!id || !body || !body.id) {
    response.status(401).json({
      message: "missing fields",
    });
    return;
  }

  return response.status(200).json({
    success: await data.claim_global_action(body.id),
  });
});
