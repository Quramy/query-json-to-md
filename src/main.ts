import { parse, print, DocumentNode, visit } from "graphql";

import { remark } from "remark";
import remarkToc from "remark-toc";

function getName(documentNode: DocumentNode) {
  let name: string | undefined = undefined;
  visit(documentNode, {
    OperationDefinition: node => {
      name = node.name?.value;
    }
  });
  return name ?? "(anonymous)";
}

export async function processJson(filename: string, json: any) {
  if (typeof json !== "object") {
    throw new Error("Invalid JSON object");
  }
  let mdBuf = `
# ${filename}
extracted from \`${filename}\`.
## Table of contents
  `;
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
      mdBuf += "\n```graphql\n" + source + "\n```\n\n";
    }
  }
  const file = await remark().use(remarkToc).process(mdBuf);
  return { markdownFile: file };
}
