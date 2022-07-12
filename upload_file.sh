#!/usr/bin/env bash

if [ $# -eq 0 ]; then
  echo "usage: ./upload_file.sh LINK_TO_FILE_TO_UPLOAD FILE_SIZE_IN_BYTES PATH_ON_S3"
  exit 1
fi

S3_BUCKET_NAME="notion_backup"
LINK_TO_FILE_TO_UPLOAD="${1}"
FILE_SIZE_IN_BYTES="${2}"
PATH_ON_S3="${3}"

curl LINK_TO_FILE_TO_UPLOAD | aws s3 cp - s3://S3_BUCKET_NAME/PATH_ON_S3 --expected-size FILE_SIZE_IN_BYTES
