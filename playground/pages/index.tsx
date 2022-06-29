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

const convertor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeHighlight, { languages: { graphql } })
  .use(rehypeStringify);

function useReportHtml() {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    fetch(url)
      .then(async res => ({ url: new URL(res.url), data: await res.json() }))
      .then(processJson)
      .then(convertor.process.bind(convertor))
      .then(file => file.toString())
      .then(setHtml);
  }, [setHtml]);
  return html;
}

const Home: NextPage = () => {
  const html = useReportHtml();
  if (!html) return null;
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
