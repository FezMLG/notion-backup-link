FROM n8nio/n8n:latest

RUN apk add --update curl aws-cli bash

RUN mkdir -p /backup/html && mkdir -p /backup/markdown