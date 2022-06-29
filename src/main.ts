import { parse, print, visit, type DocumentNode } from "graphql";

import { remark } from "remark";
import remarkToc from "remark-toc";

import type { ExtractedQueries } from "./types.js";

function getOperaionName(documentNode: DocumentNode) {
  let name: string | undefined = undefined;
  visit(documentNode, {
    OperationDefinition: node => {
      name = node.name?.value;
    }
  });
  return name ?? "(anonymous)";
}

function normalize(data: ExtractedQueries) {
  if (data.version === 2) {
    return data.operations.map(operation => ({
      hash: operation.signature,
      source: operation.document
    }));
  } else {
    return Object.entries(data).map(([hash, value]) => ({
      hash,
      source: typeof value === "string" ? value : value.source
    }));
  }
}

export async function processJson({
  url,
  data
}: {
  readonly url: URL;
  readonly data: ExtractedQueries;
}) {
  if (typeof data !== "object") {
    throw new Error("Invalid JSON object");
  }
  const [title] = (url.pathname || "Extracted queries").split("/").slice(-1);
  let mdBuf = `
# ${title}
Formatted from \`${url.toString()}\`.
## Table of contents
  `;
  for (const entry of normalize(data)) {
    const documentNode = parse(entry.source);
    const operationName = getOperaionName(documentNode);
    mdBuf += `## ${operationName}` + "\n" + `- signature: \`${entry.hash}\``;
    mdBuf += "\n```graphql\n" + print(documentNode) + "\n```\n\n";
  }
  return await remark().use(remarkToc).process(mdBuf);
}
