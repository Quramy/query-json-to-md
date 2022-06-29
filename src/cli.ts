import path from "node:path";
import fs from "node:fs/promises";
import { sync } from "mkdirp";
import prettier from "prettier";
import { processJson } from "./main.js";

async function main() {
  const jsonPath = process.argv.slice(2)[0];
  const outFilePath = process.argv.slice(2)[1] ?? process.cwd() + "/gql.md";
  if (!jsonPath) {
    console.log(`Usage:`);
    console.log(`   query-json-to-md json_file_path`);
    process.exit(0);
    return;
  }
  const jsonFile = await fs.readFile(jsonPath, "utf-8");
  const json = JSON.parse(jsonFile);
  const { markdownFile } = await processJson(path.basename(jsonPath), json);
  const distDir = path.dirname(outFilePath);
  const outStr = `# ${path.basename(jsonPath)}` + "\n" + markdownFile.toString()
  const formatted = prettier.format(outStr, { parser: "markdown" });
  await fs.writeFile(outFilePath, formatted, "utf-8");
}

main();
