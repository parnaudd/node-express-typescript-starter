import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as tw from "../twilio-client";
import { load, save } from "../store";

const router = Router();

// Configure multer for file uploads
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and PDF files are allowed"));
    }
  },
});

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

// Create document with optional file upload
router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    // Parse attributes from form data
    let attributes: Record<string, string> = {};
    if (req.body.attributes) {
      try {
        attributes = JSON.parse(req.body.attributes);
      } catch {
        attributes = req.body.attributes;
      }
    }

    // Step 1: Create the document metadata
    const doc = await tw.createSupportingDocument({
      friendlyName: req.body.friendlyName,
      type: req.body.type,
      attributes,
    });

    // Step 2: Upload file if provided
    let uploadResult = null;
    if (req.file) {
      uploadResult = await tw.uploadFileToDocument(
        doc.sid,
        req.file.path,
        attributes
      );
      // Clean up temp file
      fs.unlinkSync(req.file.path);
    }

    const store = load();
    store.documents[doc.sid] = {
      sid: doc.sid,
      friendlyName: doc.friendlyName,
      type: doc.type,
      status: doc.status,
      hasFile: !!req.file,
      createdAt: new Date().toISOString(),
    };
    save(store);

    res.json({
      ...doc,
      fileUploaded: !!req.file,
      uploadResult,
    });
  } catch (err: any) {
    // Clean up temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
});

// Upload file to existing document
router.post("/:sid/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    let attributes: Record<string, string> | undefined;
    if (req.body.attributes) {
      try {
        attributes = JSON.parse(req.body.attributes);
      } catch {
        attributes = undefined;
      }
    }

    const result = await tw.uploadFileToDocument(
      req.params.sid,
      req.file.path,
      attributes
    );

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.json(result);
  } catch (err: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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
