# notion-backup

This is a very simple tool to export a workspace from [Notion](https://www.notion.so/), designed
to work as part of a GitHub workflow.

It reads `NOTION_TOKEN` and `NOTION_SPACE_ID` from the environment, and outputs the link to download zip file with `html` or `markdown`.

**NOTE**: if you log out of your account, the `NOTION_TOKEN` will get invalidated and this process
will fail. There isn't anything that I know of that I can do about that until Notion decide to add
a backup endpoint to their official API, at which point this will be able to use a proper
authentication token.

## Prerequisites

- nodejs

## Setup

1. Get the `NOTION_TOKEN` and `NOTION_SPACE_ID` as explained in
   [this blog post](https://medium.com/@arturburtsev/automated-notion-backups-f6af4edc298d).
2. In project root create `.env.local` file from `.env` file and fill in it.

## Usage

```bash
$ node notion-backup.js
```

### Parameters

```
-f --format <format>, html or markdown, default html
-d --debug, print debug messages
```

### Run locally

```docker
docker build -t n8n_local .

docker run \
 -p 5678:5678 \
 -v $(pwd):/home/node/.n8n \
 -e N8N_BASIC_AUTH_ACTIVE="true" \
 -e N8N_BASIC_AUTH_USER="user" \
 -e N8N_BASIC_AUTH_PASSWORD="password" \
 -t n8n_local
```
