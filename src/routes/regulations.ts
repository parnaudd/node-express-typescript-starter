import { Router, Request, Response } from "express";
import * as tw from "../twilio-client";

const router = Router();

// List regulations (with optional filters)
router.get("/", async (req: Request, res: Response) => {
  try {
    const regulations = await tw.listRegulations({
      isoCountry: req.query.isoCountry as string,
      numberType: req.query.numberType as string,
      endUserType: req.query.endUserType as string,
    });
    res.json(regulations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get regulation detail
router.get("/:sid", async (req: Request, res: Response) => {
  try {
    const regulation = await tw.getRegulation(req.params.sid);
    res.json(regulation);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List end-user types
router.get("/types/end-users", async (_req: Request, res: Response) => {
  try {
    const types = await tw.listEndUserTypes();
    res.json(types);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List supporting document types
router.get("/types/documents", async (_req: Request, res: Response) => {
  try {
    const types = await tw.listSupportingDocumentTypes();
    res.json(types);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
