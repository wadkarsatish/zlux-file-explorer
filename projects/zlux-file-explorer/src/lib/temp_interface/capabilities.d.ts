
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
export type Capability = CodeEditorCapabilities | FileBrowserCapabilities;

export const enum CodeEditorCapabilities {
  CodeEditor = 'zlux.capability.code_editor',
  CodeEditorMultiBuffer = 'zlux.capability.code_editor.multi_buffer',
  CodeEditorSyntaxHighlighting = 'zlux.capability.code_editor.syntax_highlighting',
  CodeEditorLanguageAware = 'zlux.capability.code_editor.language_aware'
}

export const enum FileBrowserCapabilities {
  FileBrowser = 'zlux.capability.file_browser'
}
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
