import path from "node:path";
import url from "node:url";
import fs from "node:fs/promises";
import { sync } from "mkdirp";
import prettier from "prettier";
import { processJson } from "./main.js";

const jsonPath = process.argv.slice(2)[0];
const outFilePath = process.argv.slice(2)[1] ?? process.cwd() + "/gql.md";

if (!jsonPath) {
  console.log(`Usage:`);
  console.log(`   query-json-to-md json_file_path`);
} else {
  const jsonFile = await fs.readFile(jsonPath, "utf-8");
  const json = JSON.parse(jsonFile);
  const markdownFile = await processJson({
    url: url.pathToFileURL(jsonPath),
    data: json
  });
  const distDir = path.dirname(outFilePath);
  const formatted = prettier.format(markdownFile.toString(), {
    parser: "markdown"
  });
  await fs.writeFile(outFilePath, formatted, "utf-8");
}
