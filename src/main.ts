import path from "node:path";
import fs from "node:fs/promises";
import { sync } from "mkdirp";
import { parse, print, DocumentNode, visit } from "graphql";
import prettier from "prettier";

const mdtoc = require("markdown-toc") as (md: string) => {
  readonly content: string;
};

function getName(documentNode: DocumentNode) {
  let name: string | undefined = undefined;
  visit(documentNode, {
    OperationDefinition: node => {
      name = node.name?.value;
    }
  });
  return name ?? "(anonymous)";
}

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
  if (json.version === 2) {
    for (const operation of json.operations) {
      const {
        document,
        signature
      }: { readonly signature: string; readonly document: string } = operation;
      const documentNode = parse(document);
      const name = getName(documentNode);
      mdBuf += `## ${name}` + "\n" + `- signature: \`${signature}\``;
      mdBuf += "\n```gql\n" + print(documentNode) + "\n```\n\n";
    }
  } else {
    const hashes = Object.keys(json);
    for (const hash of hashes) {
      const {
        name,
        source
      }: { readonly name: string; readonly source: string } = json[hash];
      mdBuf += `## ${name}` + "\n" + `- signature: \`${hash}\``;
      mdBuf += "\n```gql\n" + source + "\n```\n\n";
    }
  }
  const toc = mdtoc(mdBuf);
  mdBuf =
    `# ${path.basename(jsonPath)}` + "\n## ToC\n" + toc.content + "\n" + mdBuf;
  const distDir = path.dirname(outFilePath);
  const formatted = prettier.format(mdBuf, { parser: "markdown" });
  await fs.writeFile(outFilePath, formatted, "utf-8");
}

main();
