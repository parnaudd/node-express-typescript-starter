import { Router, Request, Response } from "express";
import * as tw from "../twilio-client";
import { load, save } from "../store";

const router = Router();

// List all bundles
router.get("/", async (_req: Request, res: Response) => {
  try {
    const bundles = await tw.listBundles();
    res.json(bundles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get bundle detail
router.get("/:sid", async (req: Request, res: Response) => {
  try {
    const bundle = await tw.getBundle(req.params.sid);
    res.json(bundle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create bundle
router.post("/", async (req: Request, res: Response) => {
  try {
    const { friendlyName, email, isoCountry, numberType, endUserType, regulationSid } = req.body;
    const bundle = await tw.createBundle({
      friendlyName,
      email,
      isoCountry,
      numberType,
      endUserType,
      regulationSid,
    });

    const store = load();
    store.bundles[bundle.sid] = {
      sid: bundle.sid,
      friendlyName: bundle.friendlyName,
      status: bundle.status,
      isoCountry,
      createdAt: new Date().toISOString(),
    };
    save(store);

    res.json(bundle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Assign item (end-user or document) to bundle
router.post("/:sid/assign", async (req: Request, res: Response) => {
  try {
    const { objectSid } = req.body;
    const assignment = await tw.assignItemToBundle(req.params.sid, objectSid);

    const store = load();
    store.assignments[assignment.sid] = {
      sid: assignment.sid,
      bundleSid: req.params.sid,
      objectSid,
      createdAt: new Date().toISOString(),
    };
    save(store);

    res.json(assignment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List assignments for a bundle
router.get("/:sid/assignments", async (req: Request, res: Response) => {
  try {
    const assignments = await tw.listBundleItemAssignments(req.params.sid);
    res.json(assignments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Remove assignment from bundle
router.delete("/:bundleSid/assignments/:assignmentSid", async (req: Request, res: Response) => {
  try {
    await tw.removeBundleItemAssignment(req.params.bundleSid, req.params.assignmentSid);
    const store = load();
    delete store.assignments[req.params.assignmentSid];
    save(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submit bundle for review
router.post("/:sid/submit", async (req: Request, res: Response) => {
  try {
    const bundle = await tw.submitBundle(req.params.sid);

    const store = load();
    if (store.bundles[bundle.sid]) {
      store.bundles[bundle.sid].status = bundle.status;
    }
    save(store);

    res.json(bundle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Evaluate bundle
router.post("/:sid/evaluate", async (req: Request, res: Response) => {
  try {
    const evaluation = await tw.createEvaluation(req.params.sid);
    res.json(evaluation);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List evaluations
router.get("/:sid/evaluations", async (req: Request, res: Response) => {
  try {
    const evaluations = await tw.listEvaluations(req.params.sid);
    res.json(evaluations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete bundle
router.delete("/:sid", async (req: Request, res: Response) => {
  try {
    await tw.deleteBundle(req.params.sid);
    const store = load();
    delete store.bundles[req.params.sid];
    save(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
