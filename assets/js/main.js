// Controls for toggling iframe attributes, invisibility, prefill and logging
function $(s) {
  return document.querySelector(s);
}
function $all(s) {
  return Array.from(document.querySelectorAll(s));
}

function log(msg) {
  const p = $("#log") || $("#ccLog");
  if (!p) return;
  p.textContent += msg + "\n";
  p.scrollTop = p.scrollHeight;
}

// Apply sandbox attributes based on checked boxes for main login page
function applySandbox(iframeId, checkboxSelector) {
  const iframe = document.getElementById(iframeId);
  if (!iframe) return;
  const checked = $all(checkboxSelector)
    .filter((i) => i.checked)
    .map((i) => i.value);
  if (checked.length === 0) {
    iframe.removeAttribute("sandbox");
    log("sandbox removed");
  } else {
    iframe.setAttribute("sandbox", checked.join(" "));
    log("sandbox set: " + checked.join(" "));
  }
}

// Attach listeners
document.addEventListener("DOMContentLoaded", () => {
  // login page
  $all(".sandboxToggle").forEach((cb) =>
    cb.addEventListener("change", () =>
      applySandbox("evilFrame", ".sandboxToggle")
    )
  );
  $("#makeInvisible")?.addEventListener("change", function () {
    const iframe = $("#evilFrame");
    if (this.checked) {
      iframe.classList.add("iframe-invisible");
      log("iframe hidden via display:none");
    } else {
      iframe.classList.remove("iframe-invisible");
      log("iframe visible");
    }
  });
  $("#offscreen")?.addEventListener("change", function () {
    const iframe = $("#evilFrame");
    if (this.checked) {
      iframe.classList.add("iframe-offscreen");
      log("iframe moved offscreen");
    } else {
      iframe.classList.remove("iframe-offscreen");
      log("iframe returned onscreen");
    }
  });

  $("#prefillBoth")?.addEventListener("click", function (e) {
    e.preventDefault();
    // prefill host
    $("#hostForm [name=email]").value = "user@example.com";
    $("#hostForm [name=password]").value = "TestPass123";
    // try to prefill iframe via postMessage
    const f = document.getElementById("evilFrame");
    f.contentWindow.postMessage(
      { cmd: "prefill", email: "user@example.com", password: "TestPass123" },
      "*"
    );
  });
});
