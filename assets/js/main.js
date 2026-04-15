window.RFTest = (function () {
  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function safeStringify(value) {
    try {
      return JSON.stringify(value, null, 2);
    } catch (err) {
      return String(value);
    }
  }

  function createLogger(logEl) {
    return function log(message, tag = "INFO") {
      if (!logEl) return;
      const line = document.createElement("div");
      line.className = "log-line";
      line.textContent = `[${new Date().toLocaleTimeString()}] ${tag}: ${message}`;
      logEl.appendChild(line);
      logEl.scrollTop = logEl.scrollHeight;
    };
  }

  function initPanelToggle(options = {}) {
    const panel = options.panel || $("#controlsPanel");
    const toggle = options.toggle || $("#panelToggle");
    if (!panel || !toggle) return;

    const controlsId = panel.id || "controlsPanel";
    toggle.setAttribute("aria-controls", controlsId);
    toggle.setAttribute("aria-pressed", "true");
    toggle.setAttribute("aria-label", toggle.getAttribute("aria-label") || "Toggle control panel");

    toggle.addEventListener("click", () => {
      const hidden = panel.classList.toggle("hidden-global");
      toggle.setAttribute("aria-pressed", String(!hidden));
      toggle.title = hidden ? "Show controls" : "Hide controls";
    });
  }

  function setPanelStatus(text, el = $("#panelStatus")) {
    if (el) el.textContent = text;
  }

  function setStatus(el, type, text) {
    if (!el) return;
    el.className = "status-pill";
    if (type === "good") el.classList.add("status-good");
    else if (type === "bad") el.classList.add("status-bad");
    else if (type === "warn") el.classList.add("status-warn");
    else el.classList.add("status-idle");
    el.textContent = text;
  }

  async function copyText(text, options = {}) {
    const log = options.log || function () {};
    const fallbackHost = options.fallbackHost || document.body;
    const label = options.label || "text";

    try {
      if (!navigator.clipboard || !window.isSecureContext) {
        throw new Error("Clipboard API is unavailable in this context");
      }
      await navigator.clipboard.writeText(text);
      log(`${label} copied`);
      return true;
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.className = "form-control rf-copy-fallback";
      textarea.value = text;
      textarea.readOnly = true;
      textarea.setAttribute("aria-label", `${label} copy fallback`);

      const note = document.createElement("div");
      note.className = "alert alert-warning py-2 mt-2 mb-0";
      note.textContent = "Clipboard access was blocked. Select the text below and copy it manually.";

      fallbackHost.appendChild(note);
      fallbackHost.appendChild(textarea);
      textarea.focus();
      textarea.select();
      log(`Clipboard fallback shown for ${label}: ${err && err.message ? err.message : err}`, "WARN");
      return false;
    }
  }

  function buildSandbox() {
    const parts = [];
    if ($("#sb-allow-forms")?.checked) parts.push("allow-forms");
    if ($("#sb-allow-scripts")?.checked) parts.push("allow-scripts");
    if ($("#sb-allow-same-origin")?.checked) parts.push("allow-same-origin");
    if ($("#sb-allow-popups")?.checked) parts.push("allow-popups");
    return parts.join(" ");
  }

  function applyVisibilityMode(iframe, mode, log) {
    if (!iframe) return;
    Object.assign(iframe.style, {
      display: "",
      opacity: "",
      position: "",
      left: "",
      top: "",
      width: "",
      height: "",
      visibility: "",
      transform: "",
      pointerEvents: "",
      border: ""
    });

    if (mode === "display-none") {
      iframe.style.display = "none";
      log("Visibility: display:none");
    } else if (mode === "opacity-zero") {
      iframe.style.opacity = "0";
      iframe.style.pointerEvents = "none";
      log("Visibility: opacity:0 (invisible, still in layout)");
    } else if (mode === "offscreen") {
      iframe.style.position = "absolute";
      iframe.style.left = "-2000px";
      iframe.style.top = "-2000px";
      iframe.style.width = "600px";
      iframe.style.height = "400px";
      log("Visibility: off-screen");
    } else if (mode === "zero-size") {
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "0";
      log("Visibility: zero-size (0x0)");
    } else {
      log("Visibility: normal");
    }
  }

  function showInlineSuccess(config, log) {
    const box = $("#inlineSuccess");
    if (!box) return;
    const type = config.type === "card" ? "card" : "login";
    const title = type === "card" ? "Card form submitted" : "Login form submitted";
    const message = type === "card"
      ? "Inline success recorded. Do not use real credit card data here."
      : "Inline success recorded for the login simulation.";

    box.innerHTML = `<strong>${title}</strong><div>${message}</div><div class="muted-small">Origin: ${window.location.origin}</div>`;
    box.classList.add("is-visible");
    log(title);
  }

  function initIframeTestPage(config) {
    const iframe = $("#evil-iframe");
    const logEl = $("#log");
    const log = createLogger(logEl);
    const localForm = $(`#${config.formId}`);
    const panelStatus = $("#panelStatus");

    initPanelToggle();

    window.addEventListener("message", (ev) => {
      const data = ev.data || {};
      if (data && data.source === "EvilSite") {
        const evt = data.event || "unknown";
        if (evt === "EVIL_READY") {
          log("Evil iframe ready: " + safeStringify(data.payload), "IFRAME");
          setPanelStatus("ready", panelStatus);
        } else if (evt === "FORM_SNAPSHOT") {
          log("Iframe snapshot: " + safeStringify(data.payload && data.payload.data), "IFRAME");
          setPanelStatus("snapshot", panelStatus);
        } else if (evt === "FIELD_CHANGED") {
          log(`Iframe field changed: ${data.payload?.name} = "${data.payload?.value}"`, "IFRAME");
        } else if (evt === "FORM_SUBMIT") {
          log("Iframe form submit: " + safeStringify(data.payload), "IFRAME");
        } else {
          log("Iframe event " + evt + ": " + safeStringify(data.payload), "IFRAME");
        }
        return;
      }
      log(`Message from iframe (${ev.origin}): ${safeStringify(ev.data)}`, "IFRAME");
    });

    if (localForm) {
      ["input", "change"].forEach((eventName) => {
        localForm.addEventListener(eventName, (event) => {
          log(`${config.formLogLabel} change: ${event.target.id} = "${event.target.value}"`);
        });
      });

      localForm.addEventListener("submit", (event) => {
        event.preventDefault();
        showInlineSuccess(config, log);
      });
    }

    $("#applyBtn")?.addEventListener("click", () => {
      const sandbox = buildSandbox();
      if (sandbox.trim().length === 0) {
        iframe.removeAttribute("sandbox");
        log("Applied sandbox: (none) - iframe has NO sandbox attribute");
      } else {
        iframe.setAttribute("sandbox", sandbox);
        log("Applied sandbox: " + sandbox);
      }

      const mode = $("input[name=\"vis\"]:checked")?.value || "normal";
      applyVisibilityMode(iframe, mode, log);
    });

    $("#reloadBtn")?.addEventListener("click", () => {
      const src = iframe.getAttribute("src");
      iframe.setAttribute("src", src);
      log("Reloaded iframe");
    });

    $("#pingBtn")?.addEventListener("click", () => {
      try {
        iframe.contentWindow.postMessage({ type: "PING_PARENT", ts: Date.now() }, "*");
        log("Posted PING_PARENT to iframe");
      } catch (err) {
        log("Failed to postMessage: " + err, "ERROR");
      }
    });

    $("#snapshotBtn")?.addEventListener("click", () => {
      try {
        iframe.contentWindow.postMessage({ type: "REQUEST_SNAPSHOT", ts: Date.now() }, "*");
        log("Requested snapshot from iframe");
      } catch (err) {
        log("Snapshot request failed: " + err, "ERROR");
      }
    });

    $("#fillLocalBtn")?.addEventListener("click", () => {
      Object.keys(config.fillValues).forEach((id) => {
        const input = document.getElementById(id);
        if (input) input.value = config.fillValues[id];
      });
      log(`${config.formLogLabel} prefilled programmatically`);
    });

    $("#clearLogBtn")?.addEventListener("click", () => {
      logEl.innerHTML = "";
    });

    iframe?.addEventListener("load", () => {
      log(`Iframe loaded (src=${iframe.src})`, "IFRAME");
      try {
        iframe.contentWindow.postMessage({ type: "PING_PARENT", ts: Date.now() }, "*");
      } catch (err) {
        log("Failed to postMessage to iframe: " + err, "ERROR");
      }
    });

    log("Control panel ready. Waiting for iframe messages...");
  }

  return {
    $,
    $all,
    safeStringify,
    createLogger,
    initPanelToggle,
    setPanelStatus,
    setStatus,
    copyText,
    initIframeTestPage
  };
})();
