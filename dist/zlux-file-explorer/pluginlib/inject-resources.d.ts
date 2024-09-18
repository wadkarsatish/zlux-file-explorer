import { ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
export type InstanceId = any;
export type ViewportId = any;
export type EmbeddedInstance = {
    instanceId: InstanceId;
    viewportId: ViewportId;
};
export declare const Angular2InjectionTokens: {
    LOGGER: string;
    PLUGIN_DEFINITION: string;
    LAUNCH_METADATA: string;
    INSTANCE_ID: string;
    PLUGIN_EMBED_ACTIONS: string;
    VIEWPORT_EVENTS: string;
    MAIN_WINDOW_ID: string;
    WINDOW_ACTIONS: string;
    WINDOW_EVENTS: string;
    SESSION_EVENTS: string;
    THEME_EVENTS: string;
};
export interface Angular2PluginWindowActions {
    readonly close: () => void;
    readonly minimize: () => void;
    readonly maximize: () => void;
    readonly restore: () => void;
    readonly setTitle: (title: string) => void;
    readonly setPosition: (pos: {
        top: number;
        left: number;
        width: number;
        height: number;
    }) => void;
    readonly spawnContextMenu: (xPos: number, yPos: number, items: ContextMenuItem[], isAbsolutePos?: boolean) => boolean;
    readonly registerCloseHandler: (handler: () => Promise<void>) => void;
}
export interface Angular2PluginSessionEvents {
    readonly login: Subject<void>;
    readonly sessionExpire: Subject<void>;
    readonly autosaveEmitter: Subject<any>;
}
export interface Angular2PluginThemeEvents {
    readonly colorChanged: Subject<any>;
    readonly sizeChanged: Subject<any>;
    readonly wallpaperChanged: Subject<any>;
    readonly revertedDefault: Subject<any>;
    readonly currentColor: string;
    readonly currentSize: number;
}
export interface Angular2PluginWindowEvents {
    readonly maximized: Subject<void>;
    readonly minimized: Subject<void>;
    readonly restored: Subject<void>;
    readonly moved: Subject<{
        top: number;
        left: number;
    }>;
    readonly resized: Subject<{
        width: number;
        height: number;
    }>;
    readonly titleChanged: Subject<string>;
}
export interface Angular2PluginViewportEvents {
    readonly resized: Subject<{
        width: number;
        height: number;
    }>;
    readonly spawnContextMenu: (xPos: number, yPos: number, items: ContextMenuItem[], isAbsolutePos?: boolean) => boolean;
    readonly registerCloseHandler: (handler: () => Promise<any>) => void;
}
export interface Angular2PluginEmbedActions {
    readonly createEmbeddedInstance: (identifier: string, launchMetadata: any, viewContainer: ViewContainerRef) => Promise<EmbeddedInstance>;
}
export interface ContextMenuItem {
    text: string;
    icon?: string;
    shortcutText?: string;
    shortcutProps?: {
        "code": string;
        "altKey": boolean;
        "ctrlKey": boolean;
        "metaKey": boolean;
        "shiftKey": boolean;
    };
    action?: () => void;
    children?: ContextMenuItem[];
    disabled?: boolean;
    preventCloseMenu?: boolean;
}
