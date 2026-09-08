import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const syncPath = path.join(repositoryRoot, "data", "paper-sync.js");
const appPath = path.join(repositoryRoot, "app.js");

const syncSource = fs.readFileSync(syncPath, "utf8").trim();
const prefix = "window.PAPER_SYNC = ";

if (!syncSource.startsWith(prefix) || !syncSource.endsWith(";")) {
  throw new Error("data/paper-sync.js does not have the expected generated wrapper");
}

const sync = JSON.parse(syncSource.slice(prefix.length, -1));
const sandbox = {
  window: { PAPER_SYNC: sync },
  document: { addEventListener() {} },
  localStorage: {
    getItem() { return null; },
    setItem() {},
  },
  console,
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(appPath, "utf8"), sandbox, { filename: appPath });

const catalogue = vm.runInContext(
  `JSON.stringify({
    baseOpen: currentOpen,
    sync: PAPER_SYNC,
    summary: {
      open: allEntries().filter((entry) => entry.status === "open").length,
      solved: allEntries().filter((entry) => entry.status === "solved").length,
      syncAdditions: (PAPER_SYNC.openAdditions || []).length,
      syncResolutions: (PAPER_SYNC.resolvedEntries || []).length
    }
  })`,
  sandbox,
);

process.stdout.write(catalogue);
