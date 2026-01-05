// scripts/write-version.cjs
const fs = require("fs");
const path = require("path");

const pkgPath = path.resolve(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const outPath = path.resolve(__dirname, "..", "public", "version.json");
const out = { version: pkg.version };

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");

console.log(`[write-version] public/version.json -> ${out.version}`);
