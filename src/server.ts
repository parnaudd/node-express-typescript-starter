import "dotenv/config";
import express from "express";
import path from "path";
import regulationsRouter from "./routes/regulations";
import endUsersRouter from "./routes/end-users";
import documentsRouter from "./routes/documents";
import bundlesRouter from "./routes/bundles";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

// API routes
app.use("/api/regulations", regulationsRouter);
app.use("/api/end-users", endUsersRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/bundles", bundlesRouter);

// Serve main page
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Twilio Compliance POC running on http://localhost:${PORT}`);
});
