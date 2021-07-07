import path from "path";
import fs from "fs/promises";
import { sync } from "mkdirp";

const mdtoc = require("markdown-toc") as (md: string) => { readonly content: string };

async function main() {
  const jsonPath = process.argv.slice(2)[0];
  const outFilePath = process.argv.slice(2)[1] ?? process.cwd() + "/gql.md";
  if (!jsonPath) {
    console.log(`Usage:`);
    console.log(`   query-json-to-md json_file_path`);
    process.exit(0);
    return;
  }
  let mdBuf = "";
  const jsonFile = await fs.readFile(jsonPath, "utf-8");
  const json = JSON.parse(jsonFile);
  const hashes = Object.keys(json);
  for (const hash of hashes) {
    const {
      name,
      source
    }: { readonly name: string; readonly source: string } = json[hash];
    mdBuf += `## ${name}`;
    mdBuf += "\n```gql\n" + source + "\n```\n\n";
  }
  const toc = mdtoc(mdBuf);
  mdBuf = `# ${path.basename(jsonPath)}` + "\n## ToC\n" + toc.content + "\n" + mdBuf;
  const distDir = path.dirname(outFilePath)
  await fs.writeFile(outFilePath, mdBuf, "utf-8");
}

main();

