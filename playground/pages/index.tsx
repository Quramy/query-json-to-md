import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

import graphql from "highlight.js/lib/languages/graphql";

import styles from "../styles/Home.module.css";
import { processJson } from "../../src/main";

// TODO
const url = "github-queries.json";

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeHighlight, { languages: { graphql } })
  .use(rehypeStringify);

async function processRawData(fileName: string, jsonData: any) {
  const { markdownFile } = await processJson(fileName, jsonData);
  const htmlFile = await processor.process(markdownFile);
  return htmlFile;
}

function useReportHtml() {
  const [html, setHtml] = useState<any>(null);
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(jsonData => processRawData("hoge", jsonData))
      .then(setHtml);
  }, [setHtml]);
  return html;
}

const Home: NextPage = () => {
  const html = useReportHtml();
  return (
    <div className="markdown-container">
      <div
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default Home;
