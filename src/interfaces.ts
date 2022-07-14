export enum Format {
  HTML = "html",
  MARKDOWN = "markdown",
}

export interface TaskDto {
  task: {
    eventName: string;
    request: {
      spaceId: string | undefined;
      exportOptions: {
        exportType: Format;
        timeZone: string;
        locale: string;
      };
    };
  };
}

export enum TaskState {
  IN_PROGRESS = "in_progress",
  FAILURE = "failure",
  SUCCESS = "success",
}
