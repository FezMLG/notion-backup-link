#!/usr/bin/env node

import axios, { AxiosResponse } from "axios";
import { program } from "commander";
import { getContentType, getName } from "./headersTools";
import { Format, TaskDto, TaskState } from "./interfaces";

require("dotenv-flow").config();

const notionAPI = "https://www.notion.so/api/v3";
const { NOTION_TOKEN, NOTION_SPACE_ID } = process.env;
const client = axios.create({
  baseURL: notionAPI,
  headers: {
    Cookie: `token_v2=${NOTION_TOKEN}`,
  },
});
const die = (str: string | unknown) => {
  console.error(str);
  process.exit(1);
};

program
  .option(
    "-f, --format <format>",
    "Link with which format to return, HTML or Markdown",
    "html"
  )
  .option("-d, --debug", "Debug option", false)
  .parse();

let { format, debug } = program.opts();
format = format?.toLowerCase();

if (!["html", "markdown"].includes(format))
  die("Format can be HTML or Markdown");

if (!NOTION_TOKEN || !NOTION_SPACE_ID) {
  die(`Need to have both NOTION_TOKEN and NOTION_SPACE_ID defined in the environment.
See https://medium.com/@arturburtsev/automated-notion-backups-f6af4edc298d for
notes on how to get that information.`);
}

const log = (message: string) => {
  if (debug) console.log(message);
};

const post = async (endpoint: string, data: TaskDto | { taskIds: any[] }) => {
  return client.post(endpoint, data);
};

let response: AxiosResponse;

// formats: markdown, html
const exportFromNotion = async (format: Format) => {
  try {
    response = await post("enqueueTask", {
      task: {
        eventName: "exportSpace",
        request: {
          spaceId: NOTION_SPACE_ID,
          exportOptions: {
            exportType: format,
            timeZone: "Europe/Warsaw",
            locale: "pl",
          },
        },
      },
    });
    let {
      data: { taskId },
    } = response;
    log(`Enqueued task ${taskId}`);
    let failCount = 0,
      exportURL;

    let loop = true;
    while (loop) {
      if (failCount >= 5) break;
      const {
        data: { results: tasks },
      } = await post("getTasks", { taskIds: [taskId] });

      let task = tasks.find((t: any) => t.id === taskId);

      if (!task) {
        failCount++;
        log(`No task, waiting.`);
        continue;
      }

      if (!task.status) {
        failCount++;
        log(
          `No task status, waiting. Task was:\n${JSON.stringify(task, null, 2)}`
        );
        continue;
      }
      switch (task.state) {
        case TaskState.IN_PROGRESS:
          log(`Pages exported: ${task.status.pagesExported}`);
          break;

        case TaskState.FAILURE:
          log(`Task error: ${task.error}`);
          failCount++;
          break;

        case TaskState.SUCCESS:
          exportURL = task.status.exportURL;
          loop = false;
          break;
      }
    }
    return exportURL;
  } catch (err) {
    die(err);
  }
};

const run = async (format: Format) => {
  const url = await exportFromNotion(format);
  console.log(
    JSON.stringify({
      url,
      name: `${format}-${Date.now()}`,
      contentType: `application/zip`,
      // name: getName(response),
      // contentType: getContentType(response),
    })
  ); //return for bash
  return url;
};

run(format);
