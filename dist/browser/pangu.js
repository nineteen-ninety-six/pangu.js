var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Pangu } from "../shared/index.js";
class PerformanceMonitor {
  constructor(enabled = false) {
    __publicField(this, "metrics", /* @__PURE__ */ new Map());
    __publicField(this, "enabled");
    this.enabled = enabled;
  }
  measure(label, fn) {
    if (!this.enabled) {
      return fn();
    }
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label).push(duration);
    return result;
  }
  getStats(label) {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) {
      return null;
    }
    const total = times.reduce((a, b) => a + b, 0);
    return {
      count: times.length,
      avg: total / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      total
    };
  }
  getAllStats() {
    const report = {};
    for (const [label] of this.metrics) {
      const stats = this.getStats(label);
      if (stats) {
        report[label] = stats;
      }
    }
    return report;
  }
  reset() {
    this.metrics.clear();
  }
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  logResults() {
    if (!this.enabled) {
      return;
    }
    const report = this.getAllStats();
    if (Object.keys(report).length === 0) {
      return;
    }
    console.group("\u{1F680} Pangu.js Performance Report");
    console.table(report);
    console.groupEnd();
  }
}
function once(func) {
  let executed = false;
  return function(...args) {
    if (executed) {
      return void 0;
    }
    executed = true;
    return func(...args);
  };
}
function debounce(func, delay, mustRunDelay = Infinity) {
  let timer = null;
  let startTime = null;
  return function(...args) {
    const currentTime = Date.now();
    if (timer) {
      clearTimeout(timer);
    }
    if (!startTime) {
      startTime = currentTime;
    }
    if (currentTime - startTime >= mustRunDelay) {
      func(...args);
      startTime = currentTime;
    } else {
      timer = window.setTimeout(() => {
        func(...args);
      }, delay);
    }
  };
}
class BrowserPangu extends Pangu {
  constructor() {
    var _a;
    super();
    __publicField(this, "isAutoSpacingPageExecuted");
    __publicField(this, "autoSpacingPageObserver");
    __publicField(this, "performanceMonitor");
    __publicField(this, "blockTags");
    __publicField(this, "ignoredTags");
    __publicField(this, "presentationalTags");
    __publicField(this, "spaceLikeTags");
    __publicField(this, "spaceSensitiveTags");
    __publicField(this, "ignoredClass");
    this.isAutoSpacingPageExecuted = false;
    this.autoSpacingPageObserver = null;
    const isDevelopment = typeof process !== "undefined" && ((_a = process.env) == null ? void 0 : _a.NODE_ENV) === "development";
    this.performanceMonitor = new PerformanceMonitor(isDevelopment);
    this.blockTags = /^(div|p|h1|h2|h3|h4|h5|h6)$/i;
    this.ignoredTags = /^(code|pre|script|style|textarea|iframe|input)$/i;
    this.presentationalTags = /^(b|code|del|em|i|s|strong|kbd)$/i;
    this.spaceLikeTags = /^(br|hr|i|img|pangu)$/i;
    this.spaceSensitiveTags = /^(a|del|pre|s|strike|u)$/i;
    this.ignoredClass = "no-pangu-spacing";
  }
  autoSpacingPage({ pageDelayMs = 1e3, nodeDelayMs = 500, nodeMaxWaitMs = 2e3 } = {}) {
    if (!(document.body instanceof Node)) {
      return;
    }
    if (this.isAutoSpacingPageExecuted) {
      return;
    }
    this.isAutoSpacingPageExecuted = true;
    const spacingPageOnce = once(() => {
      this.spacingPage();
    });
    const videos = document.getElementsByTagName("video");
    if (videos.length === 0) {
      setTimeout(() => {
        spacingPageOnce();
      }, pageDelayMs);
    } else {
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        if (video.readyState === 4) {
          setTimeout(() => {
            spacingPageOnce();
          }, 3e3);
          break;
        }
        video.addEventListener("loadeddata", () => {
          setTimeout(() => {
            spacingPageOnce();
          }, 4e3);
        });
      }
    }
    this.setupAutoSpacingPageObserver(nodeDelayMs, nodeMaxWaitMs);
  }
  spacingPage() {
    this.performanceMonitor.measure("spacingPage", () => {
      this.spacingPageTitle();
      this.spacingPageBody();
    });
    this.performanceMonitor.logResults();
  }
  spacingPageTitle() {
    this.performanceMonitor.measure("spacingPageTitle", () => {
      const titleElement = document.querySelector("head > title");
      if (titleElement) {
        this.spacingNode(titleElement);
      }
    });
  }
  spacingPageBody() {
    this.performanceMonitor.measure("spacingPageBody", () => {
      this.spacingNode(document.body);
    });
  }
  spacingNode(contextNode) {
    this.spacingNodeWithTreeWalker(contextNode);
  }
  spacingElementById(idName) {
    const element = document.getElementById(idName);
    if (element) {
      this.spacingNode(element);
    }
  }
  spacingElementByClassName(className) {
    const elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
      this.spacingNode(elements[i]);
    }
  }
  spacingElementByTagName(tagName) {
    const elements = document.getElementsByTagName(tagName);
    for (let i = 0; i < elements.length; i++) {
      this.spacingNode(elements[i]);
    }
  }
  stopAutoSpacingPage() {
    if (this.autoSpacingPageObserver) {
      this.autoSpacingPageObserver.disconnect();
      this.autoSpacingPageObserver = null;
    }
    this.isAutoSpacingPageExecuted = false;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isContentEditable(node) {
    return node.isContentEditable || node.getAttribute && node.getAttribute("g_editable") === "true";
  }
  isSpecificTag(node, tagRegex) {
    return node && node.nodeName && tagRegex.test(node.nodeName);
  }
  isInsideSpecificTag(node, tagRegex, checkCurrent = false) {
    let currentNode = node;
    if (checkCurrent) {
      if (this.isSpecificTag(currentNode, tagRegex)) {
        return true;
      }
    }
    while (currentNode.parentNode) {
      currentNode = currentNode.parentNode;
      if (this.isSpecificTag(currentNode, tagRegex)) {
        return true;
      }
    }
    return false;
  }
  hasIgnoredClass(node) {
    if (node instanceof Element && node.classList.contains(this.ignoredClass)) {
      return true;
    }
    if (node.parentNode && node.parentNode instanceof Element && node.parentNode.classList.contains(this.ignoredClass)) {
      return true;
    }
    return false;
  }
  canIgnoreNode(node) {
    let currentNode = node;
    if (currentNode && (this.isSpecificTag(currentNode, this.ignoredTags) || this.isContentEditable(currentNode) || this.hasIgnoredClass(currentNode))) {
      return true;
    }
    while (currentNode.parentNode) {
      currentNode = currentNode.parentNode;
      if (currentNode && (this.isSpecificTag(currentNode, this.ignoredTags) || this.isContentEditable(currentNode))) {
        return true;
      }
    }
    return false;
  }
  isFirstTextChild(parentNode, targetNode) {
    const { childNodes } = parentNode;
    for (let i = 0; i < childNodes.length; i++) {
      const childNode = childNodes[i];
      if (childNode.nodeType !== Node.COMMENT_NODE && childNode.textContent) {
        return childNode === targetNode;
      }
    }
    return false;
  }
  isLastTextChild(parentNode, targetNode) {
    const { childNodes } = parentNode;
    for (let i = childNodes.length - 1; i > -1; i--) {
      const childNode = childNodes[i];
      if (childNode.nodeType !== Node.COMMENT_NODE && childNode.textContent) {
        return childNode === targetNode;
      }
    }
    return false;
  }
  processTextNodes(textNodes) {
    let currentTextNode;
    let nextTextNode = null;
    for (let i = 0; i < textNodes.length; i++) {
      currentTextNode = textNodes[i];
      if (!currentTextNode) {
        continue;
      }
      if (this.canIgnoreNode(currentTextNode)) {
        nextTextNode = currentTextNode;
        continue;
      }
      if (currentTextNode instanceof Text) {
        if (currentTextNode.data.length === 1 && /["\u201c\u201d]/.test(currentTextNode.data)) {
          if (currentTextNode.previousSibling) {
            const prevNode = currentTextNode.previousSibling;
            if (prevNode.nodeType === Node.ELEMENT_NODE && prevNode.textContent) {
              const lastChar = prevNode.textContent.slice(-1);
              if (/[\u4e00-\u9fff]/.test(lastChar)) {
                currentTextNode.data = ` ${currentTextNode.data}`;
              }
            }
          }
        } else {
          const newText = this.spacingText(currentTextNode.data);
          if (currentTextNode.data !== newText) {
            currentTextNode.data = newText;
          }
        }
      }
      if (nextTextNode) {
        if (currentTextNode.nextSibling && this.spaceLikeTags.test(currentTextNode.nextSibling.nodeName)) {
          nextTextNode = currentTextNode;
          continue;
        }
        if (!(currentTextNode instanceof Text) || !(nextTextNode instanceof Text)) {
          continue;
        }
        const currentEndsWithSpace = currentTextNode.data.endsWith(" ");
        const nextStartsWithSpace = nextTextNode.data.startsWith(" ");
        let hasWhitespaceBetween = false;
        let currentAncestor = currentTextNode;
        while (currentAncestor.parentNode && this.isLastTextChild(currentAncestor.parentNode, currentAncestor) && !this.spaceSensitiveTags.test(currentAncestor.parentNode.nodeName)) {
          currentAncestor = currentAncestor.parentNode;
        }
        let nextAncestor = nextTextNode;
        while (nextAncestor.parentNode && this.isFirstTextChild(nextAncestor.parentNode, nextAncestor) && !this.spaceSensitiveTags.test(nextAncestor.parentNode.nodeName)) {
          nextAncestor = nextAncestor.parentNode;
        }
        let nodeBetween = currentAncestor.nextSibling;
        while (nodeBetween && nodeBetween !== nextAncestor) {
          if (nodeBetween.nodeType === Node.TEXT_NODE && nodeBetween.textContent && /\s/.test(nodeBetween.textContent)) {
            hasWhitespaceBetween = true;
            break;
          }
          nodeBetween = nodeBetween.nextSibling;
        }
        if (currentEndsWithSpace || nextStartsWithSpace || hasWhitespaceBetween) {
          nextTextNode = currentTextNode;
          continue;
        }
        const testText = currentTextNode.data.slice(-1) + nextTextNode.data.slice(0, 1);
        const testNewText = this.spacingText(testText);
        const currentLast = currentTextNode.data.slice(-1);
        const nextFirst = nextTextNode.data.slice(0, 1);
        const isQuote = (char) => /["\u201c\u201d]/.test(char);
        const isCJK = (char) => /[\u4e00-\u9fff]/.test(char);
        const skipSpacing = isQuote(currentLast) && isCJK(nextFirst) || isCJK(currentLast) && isQuote(nextFirst);
        if (testNewText !== testText && !skipSpacing) {
          let nextNode = nextTextNode;
          while (nextNode.parentNode && !this.spaceSensitiveTags.test(nextNode.nodeName) && this.isFirstTextChild(nextNode.parentNode, nextNode)) {
            nextNode = nextNode.parentNode;
          }
          let currentNode = currentTextNode;
          while (currentNode.parentNode && !this.spaceSensitiveTags.test(currentNode.nodeName) && this.isLastTextChild(currentNode.parentNode, currentNode)) {
            currentNode = currentNode.parentNode;
          }
          if (currentNode.nextSibling) {
            if (this.spaceLikeTags.test(currentNode.nextSibling.nodeName)) {
              nextTextNode = currentTextNode;
              continue;
            }
          }
          if (!this.blockTags.test(currentNode.nodeName)) {
            if (!this.spaceSensitiveTags.test(nextNode.nodeName)) {
              if (!this.ignoredTags.test(nextNode.nodeName) && !this.blockTags.test(nextNode.nodeName)) {
                if (nextTextNode.previousSibling) {
                  if (!this.spaceLikeTags.test(nextTextNode.previousSibling.nodeName)) {
                    if (nextTextNode instanceof Text && !nextTextNode.data.startsWith(" ")) {
                      nextTextNode.data = ` ${nextTextNode.data}`;
                    }
                  }
                } else {
                  if (!this.canIgnoreNode(nextTextNode)) {
                    if (nextTextNode instanceof Text && !nextTextNode.data.startsWith(" ")) {
                      nextTextNode.data = ` ${nextTextNode.data}`;
                    }
                  }
                }
              }
            } else if (!this.spaceSensitiveTags.test(currentNode.nodeName)) {
              if (currentTextNode instanceof Text && !currentTextNode.data.endsWith(" ")) {
                currentTextNode.data = `${currentTextNode.data} `;
              }
            } else {
              const panguSpace = document.createElement("pangu");
              panguSpace.innerHTML = " ";
              if (nextNode.parentNode) {
                if (nextNode.previousSibling) {
                  if (!this.spaceLikeTags.test(nextNode.previousSibling.nodeName)) {
                    nextNode.parentNode.insertBefore(panguSpace, nextNode);
                  }
                } else {
                  nextNode.parentNode.insertBefore(panguSpace, nextNode);
                }
              }
              if (!panguSpace.previousElementSibling) {
                if (panguSpace.parentNode) {
                  panguSpace.parentNode.removeChild(panguSpace);
                }
              }
            }
          }
        }
      }
      nextTextNode = currentTextNode;
    }
  }
  collectTextNodes(contextNode, reverse = false) {
    const nodes = [];
    if (!contextNode || contextNode instanceof DocumentFragment) {
      return nodes;
    }
    const walker = document.createTreeWalker(
      contextNode,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (!node.nodeValue || !/\S/.test(node.nodeValue)) {
            return NodeFilter.FILTER_REJECT;
          }
          let currentNode = node;
          while (currentNode) {
            if (currentNode instanceof Element) {
              if (this.ignoredTags.test(currentNode.nodeName)) {
                return NodeFilter.FILTER_REJECT;
              }
              if (this.isContentEditable(currentNode)) {
                return NodeFilter.FILTER_REJECT;
              }
              if (currentNode.classList.contains(this.ignoredClass)) {
                return NodeFilter.FILTER_REJECT;
              }
            }
            currentNode = currentNode.parentNode;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }
    return reverse ? nodes.reverse() : nodes;
  }
  spacingNodeWithTreeWalker(contextNode) {
    if (!(contextNode instanceof Node) || contextNode instanceof DocumentFragment) {
      return;
    }
    const textNodes = this.performanceMonitor.measure("collectTextNodes", () => {
      return this.collectTextNodes(contextNode, true);
    });
    this.performanceMonitor.measure("processTextNodes", () => {
      this.processTextNodes(textNodes);
    });
  }
  setupAutoSpacingPageObserver(nodeDelayMs, nodeMaxWaitMs) {
    if (this.autoSpacingPageObserver) {
      this.autoSpacingPageObserver.disconnect();
      this.autoSpacingPageObserver = null;
    }
    const queue = [];
    const debouncedSpacingTitle = debounce(
      () => {
        this.spacingPageTitle();
      },
      nodeDelayMs,
      nodeMaxWaitMs
    );
    const debouncedSpacingNode = debounce(
      () => {
        while (queue.length) {
          const node = queue.shift();
          if (node) {
            this.spacingNode(node);
          }
        }
      },
      nodeDelayMs,
      nodeMaxWaitMs
    );
    this.autoSpacingPageObserver = new MutationObserver((mutations) => {
      var _a;
      let titleChanged = false;
      for (const mutation of mutations) {
        if (((_a = mutation.target.parentNode) == null ? void 0 : _a.nodeName) === "TITLE" || mutation.target.nodeName === "TITLE") {
          titleChanged = true;
          continue;
        }
        switch (mutation.type) {
          case "characterData":
            const { target: node } = mutation;
            if (node.nodeType === Node.TEXT_NODE && node.parentNode) {
              queue.push(node.parentNode);
            }
            break;
          case "childList":
            for (const node2 of mutation.addedNodes) {
              if (node2.nodeType === Node.ELEMENT_NODE) {
                queue.push(node2);
              } else if (node2.nodeType === Node.TEXT_NODE && node2.parentNode) {
                queue.push(node2.parentNode);
              }
            }
            break;
        }
      }
      if (titleChanged) {
        debouncedSpacingTitle();
      }
      debouncedSpacingNode();
    });
    this.autoSpacingPageObserver.observe(document.body, {
      characterData: true,
      childList: true,
      subtree: true
    });
    this.autoSpacingPageObserver.observe(document.head, {
      characterData: true,
      childList: true,
      subtree: true
      // Need subtree to observe text node changes inside title
    });
  }
  // Performance monitoring methods
  enablePerformanceMonitoring() {
    this.performanceMonitor.setEnabled(true);
  }
  disablePerformanceMonitoring() {
    this.performanceMonitor.setEnabled(false);
  }
  getPerformanceReport() {
    return this.performanceMonitor.getAllStats();
  }
  getPerformanceStats(label) {
    return this.performanceMonitor.getStats(label);
  }
  resetPerformanceMetrics() {
    this.performanceMonitor.reset();
  }
  logPerformanceResults() {
    this.performanceMonitor.logResults();
  }
}
const pangu = new BrowserPangu();
export {
  BrowserPangu,
  pangu as default,
  pangu
};
//# sourceMappingURL=pangu.js.map
