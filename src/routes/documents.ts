import { Router, Request, Response } from "express";
import * as tw from "../twilio-client";
import { load, save } from "../store";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const docs = await tw.listSupportingDocuments();
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:sid", async (req: Request, res: Response) => {
  try {
    const doc = await tw.getSupportingDocument(req.params.sid);
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { friendlyName, type, attributes } = req.body;
    const doc = await tw.createSupportingDocument({
      friendlyName,
      type,
      attributes: attributes || {},
    });

    const store = load();
    store.documents[doc.sid] = {
      sid: doc.sid,
      friendlyName: doc.friendlyName,
      type: doc.type,
      status: doc.status,
      createdAt: new Date().toISOString(),
    };
    save(store);

    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:sid", async (req: Request, res: Response) => {
  try {
    const { friendlyName, attributes } = req.body;
    const doc = await tw.updateSupportingDocument(req.params.sid, { friendlyName, attributes });

    const store = load();
    if (store.documents[doc.sid]) {
      store.documents[doc.sid].friendlyName = doc.friendlyName;
    }
    save(store);

    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:sid", async (req: Request, res: Response) => {
  try {
    await tw.deleteSupportingDocument(req.params.sid);
    const store = load();
    delete store.documents[req.params.sid];
    save(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
