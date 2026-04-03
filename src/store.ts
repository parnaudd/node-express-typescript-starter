import fs from "fs";
import path from "path";

const STORE_PATH = path.join(__dirname, "..", "data", "store.json");

interface Store {
  endUsers: Record<string, any>;
  documents: Record<string, any>;
  bundles: Record<string, any>;
  assignments: Record<string, any>;
}

function ensureDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function load(): Store {
  ensureDir();
  if (!fs.existsSync(STORE_PATH)) {
    return { endUsers: {}, documents: {}, bundles: {}, assignments: {} };
  }
  return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
}

export function save(store: Store) {
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}
