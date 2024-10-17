
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { IComponent } from './component';
import { Observable, Subject } from 'rxjs';

type CodeEditorBufferHandle = any;

export interface CodeEditorFileOpenedEvent {
  buffer: CodeEditorBufferHandle;
  file: string;
}

export interface CodeEditorBufferSavedEvent {
  buffer: CodeEditorBufferHandle;
  file: string;
}

export interface CodeEditorBufferCreatedEvent {
  buffer: CodeEditorBufferHandle;
}

export interface CodeEditorBufferDestroyedEvent {
  buffer: CodeEditorBufferHandle;
  file: string | null;
}

export interface ICodeEditor extends IComponent {
  /* Actions */
  getPrimaryBuffer(): CodeEditorBufferHandle;
  getBufferPath(buffer: CodeEditorBufferHandle): string | null;
  openFile(file: string, targetBuffer: CodeEditorBufferHandle | null): Observable<CodeEditorBufferHandle>;
  saveBuffer(buffer: CodeEditorBufferHandle, path: string | null): Observable<void>;
  getBufferContents(buffer: CodeEditorBufferHandle): Observable<string>;

  /* Events */
  fileOpened: Subject<CodeEditorFileOpenedEvent>;
  bufferSaved: Subject<CodeEditorBufferSavedEvent>;
}

export interface ICodeEditorMultiBuffer extends ICodeEditor {
  /* Actions */
  getOpenBuffers(): CodeEditorBufferHandle[];
  createBuffer(): CodeEditorBufferHandle;
  destroyBuffer(buffer: CodeEditorBufferHandle, force: boolean): Observable<void>;

  /* Events */
  bufferCreated: Subject<CodeEditorBufferCreatedEvent>;
  bufferDestroyed: Subject<CodeEditorBufferDestroyedEvent>;
}

export interface ICodeEditorSyntaxHighlighting extends ICodeEditor {
  setHighlightingModeForBuffer(buffer: CodeEditorBufferHandle, language: string): void;
  getHighlightingModeForBuffer(buffer: CodeEditorBufferHandle): string;
  getRecommendedHighlightingModesForBuffer(buffer: CodeEditorBufferHandle): Observable<string[]>;
  getSupportedHighlightingModes(): Observable<string[]>;
}

export interface ICodeEditorLanguageAware extends ICodeEditor {
  getLanguageForBuffer(buffer: CodeEditorBufferHandle): string;
  setLanguageForBuffer(buffer: CodeEditorBufferHandle, language: string): void;
  getRecommendedLanguagesForBuffer(buffer: CodeEditorBufferHandle): Observable<string[]>;
  getSupportedLanguages(): Observable<string[]>;
  getSymbols(buffer: CodeEditorBufferHandle): Observable<string[]>;
  jumpToSymbol(buffer: CodeEditorBufferHandle, symbol: string): void;
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
