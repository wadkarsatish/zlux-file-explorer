This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
# File Tree

This is an Angular component included in some Zowe Desktop apps (like Zowe Editor) to browse and edit files and datasets on z/OS through the Zowe ZSS server APIs, in a tree-like experience. Using the Zowe context menu, there is also a growing support of right click CRUD & other actions.

**NOTE: Because this relies upon ZSS APIs, it must be used in an environment which handles session lifecycles, as you must log in to ZSS prior to using those APIs. One way to utilize this is to use this within a Zowe App, within the Zowe Desktop. An alternative to ZSS if you don't have access to a mainframe is the ZSS mock server (https://github.com/zowe/zss/tree/v2.x/staging/mock)**

## Installing dependencies
You must set the @zowe registry scope to get this library, as it is not yet on npmjs.org

```
npm config set @zowe:registry https://zowe.jfrog.io/zowe/api/npm/npm-release/
npm install --save-prod @zowe/zlux-angular-file-tree
```

## Embedding FT into your own app

Then, navigate to your application's module file. Import the File Tree module by adding
```import { FileTreeModule } from '@zowe/zlux-angular-file-tree/src/plugin';```
and then, add the File Tree module into your application's module.
```...,
FileTreeModule,
...,
```

Now, in your application's HTML template, given they are within the scope of your module, you can import the File Explorer widget as
```<zlux-file-tree (nodeClick)="onNodeClick($event)"></zlux-file-tree>```
with an optional (style) input to specify the color, size, or other properties of the main tree container.


## Develop your app with local version of FT - Option 1 Linking
If you want to develop the File Tree and your own app simultaneously, you can do the following:

### Part I- How to link

#### Add npm symlink 
Note: @zowe/zlux-angular-file-tree is package name in package.json
```
cd zlux-file-explorer
npm link 
```
#### Replace dependency in your app
```
cd my-app/webClient
npm link @zowe/zlux-angular-file-tree
```

### Part II - Back to normal, how to delink

#### Remove Dependency link
```
cd my-app/webClient
npm unlink
```

#### Delete npm symlink

```
cd zlux-file-explorer
npm uninstall
```

## Develop your app with local version of FT - Option 2 Local path
An alternative to option 1 is to use a local path.

#### Add local path of built FT
Change the package.json of your app to point to the local path of the built FT. For example in package.json,
```
[...]
"@zowe/zlux-angular-file-tree": "file://../../your-local-path/zlux-file-explorer",
[...]
```
## Develop your app with local version of FT - Option 3 Git path
Change the package.json of your app to point to the Git repo & branch. Your Git repo may also be your fork. For example in package.json,
```
[...]
"@zowe/zlux-angular-file-tree": "git+https://github.com/zowe/zlux-file-explorer.git#<your-branch>",
[...]
```

## How to build a File Tree release

1. Set the version number you want https://github.com/zowe/zlux-file-explorer/blob/staging/package.json#L3 . 
2. Reinstall the app to update the package-lock.json too.
3. Click on GitHub "Actions" tab at the top. Select "Build and Test Workflow".
4. Click on "Run workflow" dropdown. Select desired branch and release text string i.e. "RC1" to build a FT npm release

## What version of Font Awesome does the FT use?
It's a dependency not listed in package.json because it comes with PrimeNG. Our current version of PrimeNG is 6, therefore
we are using FA v4 (https://fontawesome.com/v4/icons/)

This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
