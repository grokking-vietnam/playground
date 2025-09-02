/// <reference types='@modern-js/app-tools/types' />

// Declare module for .css files
declare module '*.css' {
  const content: any;
  export default content;
}

// Declare module for .svg files
declare module '*.svg' {
  const content: any;
  export default content;
}

// Declare module for image files
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    SHELL_URL?: string;
    USER_MANAGEMENT_URL?: string;
    PERMISSION_CONTROL_URL?: string;
    WORKFLOW_MANAGEMENT_URL?: string;
    SQL_EDITOR_URL?: string;
  }
}
