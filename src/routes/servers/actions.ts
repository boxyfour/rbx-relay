// Handles creating, getting, and actions on actions

import { Router } from "express";
import { requireAny, requireWrite } from "../../middleware/auth";
import { data } from "../../store";

export let router = Router();
export let url = "/actions/";

// Gets s
router.post("/:id/action", requireWrite, async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  if (!body) return res.status(400).json({ message: "missing action details" });
  if (!(await data.server(id)))
    return res.status(400).json({ message: "server not found" });

  await data.add_action(id, body);
  res.sendStatus(200);
});
