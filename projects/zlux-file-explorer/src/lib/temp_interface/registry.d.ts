
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Capability } from './capabilities';
import { IComponent } from './component';
import { ComponentClass } from './classes';

export abstract class ComponentFactory {
  constructor(componentClass: ComponentClass, capabilities: Capability[]);

  belongsToClass(ComponentClass: ComponentClass):boolean;
  hasCapability(capability: Capability):boolean;
  getCapabilities(): Capability[];
  abstract instantiateIntoDOM(target: HTMLElement): IComponent;
}

export class Registry {
  constructor();

  registerComponentFactory(factory: ComponentFactory): void;
  getComponentFactories(componentClass: ComponentClass, capabilities: Capability[]): ComponentFactory[];
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
