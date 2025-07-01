import { Pangu } from '../shared';
export interface AutoSpacingPageConfig {
    pageDelayMs?: number;
    nodeDelayMs?: number;
    nodeMaxWaitMs?: number;
}
export interface IdleDeadline {
    didTimeout: boolean;
    timeRemaining(): number;
}
export interface IdleRequestCallback {
    (deadline: IdleDeadline): void;
}
export interface IdleSpacingConfig {
    enabled: boolean;
    chunkSize: number;
    timeout: number;
}
export interface VisibilityCheckConfig {
    enabled: boolean;
    checkDuringIdle: boolean;
    commonHiddenPatterns: {
        clipRect: boolean;
        displayNone: boolean;
        visibilityHidden: boolean;
        opacityZero: boolean;
        heightWidth1px: boolean;
    };
}
export interface IdleSpacingCallbacks {
    onComplete?: () => void;
    onProgress?: (processed: number, total: number) => void;
}
declare class IdleQueue {
    private queue;
    private isProcessing;
    private requestIdleCallback;
    private totalItems;
    private processedItems;
    private callbacks;
    constructor();
    add(work: () => void): void;
    clear(): void;
    setCallbacks(callbacks: IdleSpacingCallbacks): void;
    get length(): number;
    get progress(): {
        processed: number;
        total: number;
        percentage: number;
    };
    private scheduleProcessing;
    private process;
}
export declare class BrowserPangu extends Pangu {
    isAutoSpacingPageExecuted: boolean;
    protected autoSpacingPageObserver: MutationObserver | null;
    protected idleQueue: IdleQueue;
    protected idleSpacingConfig: IdleSpacingConfig;
    protected visibilityCheckConfig: VisibilityCheckConfig;
    blockTags: RegExp;
    ignoredTags: RegExp;
    presentationalTags: RegExp;
    spaceLikeTags: RegExp;
    spaceSensitiveTags: RegExp;
    ignoredClass: string;
    constructor();
    autoSpacingPage({ pageDelayMs, nodeDelayMs, nodeMaxWaitMs }?: AutoSpacingPageConfig): void;
    spacingPage(): void;
    spacingPageTitle(): void;
    spacingPageBody(): void;
    spacingNode(contextNode: Node): void;
    spacingElementById(idName: string): void;
    spacingElementByClassName(className: string): void;
    spacingElementByTagName(tagName: string): void;
    stopAutoSpacingPage(): void;
    protected isContentEditable(node: any): any;
    protected isSpecificTag(node: Node, tagRegex: RegExp): boolean | "";
    protected isInsideSpecificTag(node: Node, tagRegex: RegExp, checkCurrent?: boolean): boolean;
    protected hasIgnoredClass(node: Node): boolean;
    protected canIgnoreNode(node: Node): boolean;
    protected isFirstTextChild(parentNode: Node, targetNode: Node): boolean;
    protected isLastTextChild(parentNode: Node, targetNode: Node): boolean;
    protected processTextNodes(textNodes: Node[]): void;
    protected collectTextNodes(contextNode: Node, reverse?: boolean): Text[];
    protected spacingNodeWithTreeWalker(contextNode: Node): void;
    protected processTextNodesWithIdleCallback(textNodes: Node[], callbacks?: IdleSpacingCallbacks): void;
    protected setupAutoSpacingPageObserver(nodeDelayMs: number, nodeMaxWaitMs: number): void;
    updateIdleSpacingConfig(config: Partial<IdleSpacingConfig>): void;
    getIdleSpacingConfig(): IdleSpacingConfig;
    getIdleQueueLength(): number;
    clearIdleQueue(): void;
    getIdleProgress(): {
        processed: number;
        total: number;
        percentage: number;
    };
    spacingPageWithIdleCallback(callbacks?: IdleSpacingCallbacks): void;
    spacingNodeWithIdleCallback(contextNode: Node, callbacks?: IdleSpacingCallbacks): void;
    spacingNodesWithIdleCallback(nodes: Node[], callbacks?: IdleSpacingCallbacks): void;
    updateVisibilityCheckConfig(config: Partial<VisibilityCheckConfig>): void;
    getVisibilityCheckConfig(): VisibilityCheckConfig;
    isElementVisuallyHidden(element: Element): boolean;
    protected shouldSkipSpacingAfterNode(node: Node): boolean;
}
export declare const pangu: BrowserPangu;
export default pangu;
