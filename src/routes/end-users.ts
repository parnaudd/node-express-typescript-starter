import { Router, Request, Response } from "express";
import * as tw from "../twilio-client";
import { load, save } from "../store";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const endUsers = await tw.listEndUsers();
    res.json(endUsers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { friendlyName, type, attributes } = req.body;
    const endUser = await tw.createEndUser({
      friendlyName,
      type,
      attributes: attributes || {},
    });

    // Save locally
    const store = load();
    store.endUsers[endUser.sid] = {
      sid: endUser.sid,
      friendlyName: endUser.friendlyName,
      type: endUser.type,
      createdAt: new Date().toISOString(),
    };
    save(store);

    res.json(endUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:sid", async (req: Request, res: Response) => {
  try {
    await tw.deleteEndUser(req.params.sid);
    const store = load();
    delete store.endUsers[req.params.sid];
    save(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
