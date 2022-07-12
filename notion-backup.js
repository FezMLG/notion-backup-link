#!/usr/bin/env node

let { program } = require("commander"),
  axios = require("axios"),
  { retry } = require("async"),
  { join } = require("path"),
  notionAPI = "https://www.notion.so/api/v3",
  { NOTION_TOKEN, NOTION_SPACE_ID } = process.env,
  client = axios.create({
    baseURL: notionAPI,
    headers: {
      Cookie: `token_v2=${NOTION_TOKEN}`,
    },
  }),
  die = (str) => {
    console.error(str);
    process.exit(1);
  };

program.version(require("./package.json").version);

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

function log(message) {
  if (debug) console.log(message);
}

async function post(endpoint, data) {
  return client.post(endpoint, data);
}

// formats: markdown, html
async function exportFromNotion(format) {
  try {
    let {
      data: { taskId },
    } = await post("enqueueTask", {
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
    log(`Enqueued task ${taskId}`);
    let failCount = 0,
      exportURL;
    while (true) {
      if (failCount >= 5) break;
      let {
        data: { results: tasks },
      } = await retry({ times: 3, interval: 2000 }, async () =>
        post("getTasks", { taskIds: [taskId] })
      );
      let task = tasks.find((t) => t.id === taskId);
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
      if (task.state === "in_progress") {
        log(`Pages exported: ${task.status.pagesExported}`);
      }
      if (task.state === "failure") {
        failCount++;
        log(`Task error: ${task.error}`);
        continue;
      }
      if (task.state === "success") {
        exportURL = task.status.exportURL;
        break;
      }
    }
    return exportURL;
  } catch (err) {
    die(err);
  }
}

async function run(format) {
  const url = await exportFromNotion(format);
  log(url);
  return url;
}

console.log(run(format)); //return for bash
