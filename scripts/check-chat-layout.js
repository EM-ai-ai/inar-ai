// Headless regression check. Uses an isolated Chrome profile and synthetic content;
// it never opens Electron, the installed app, or the user's browser profile.
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { once } = require("node:events");

const appDir = path.join(__dirname, "..", "Codice App AI InAr");
const browserPath = process.env.INAR_LAYOUT_BROWSER || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "inar-layout-"));
  const browser = spawn(browserPath, [
    "--headless=new", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"
  ], { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
  let socket;
  try {
    const endpoint = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Chrome startup timed out")), 15000);
      browser.once("error", reject);
      browser.stderr.on("data", (chunk) => {
        const match = String(chunk).match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) { clearTimeout(timeout); resolve(new URL(match[1]).origin.replace("ws:", "http:")); }
      });
    });
    const targets = await (await fetch(`${endpoint}/json/list`)).json();
    socket = new WebSocket(targets.find((target) => target.type === "page").webSocketDebuggerUrl);
    await once(socket, "open");
    let nextId = 0;
    const pending = new Map();
    socket.addEventListener("message", ({ data }) => {
      const result = JSON.parse(data);
      if (!pending.has(result.id)) return;
      const { resolve, reject, timeout } = pending.get(result.id);
      pending.delete(result.id);
      clearTimeout(timeout);
      if (result.error) reject(new Error(JSON.stringify(result.error)));
      else resolve(result.result);
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++nextId;
      const timeout = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 10000);
      pending.set(id, { resolve, reject, timeout });
      socket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async (expression) => {
      const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ": " + result.exceptionDetails.exception?.description);
      return result.result.value;
    };
    await send("Page.enable");
    // A local origin gives the preload real sessionStorage without any external requests.
    const server = require("node:http").createServer((request, response) => response.end("<!doctype html><title>InAR layout fixture</title>"));
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      await send("Page.navigate", { url: `http://127.0.0.1:${server.address().port}/notebook/fixture` });
      await delay(200);
      const sources = Object.fromEntries(fs.readdirSync(path.join(appDir, "src"))
        .filter((name) => name.endsWith(".js"))
        .map((name) => [name, fs.readFileSync(path.join(appDir, "src", name), "utf8")]));
      const assets = Object.fromEntries(["inar-logo-full.webp", "inar-hospital-blueprint.png"].map((name) => [
        name, fs.readFileSync(path.join(appDir, "assets", name)).toString("base64")
      ]));
      await evaluate(`(() => {
        document.head.insertAdjacentHTML('beforeend', '<style>html,body{margin:0;height:100%;overflow:hidden;background:#222}section.chat-panel{position:absolute;left:27%;top:64px;width:47%;bottom:24px;display:flex;flex-direction:column;overflow:hidden}.panel-header{height:49px;flex-shrink:0}.conversation{flex:1;min-height:0;overflow:auto}.message{height:100px}form{flex:none;height:64px}textarea{width:70%}</style>');
        document.body.innerHTML = '<section class="source-panel"></section><section class="chat-panel"><header class="panel-header">Original heading</header><div class="conversation">' + Array.from({length:40}, (_, i) => '<div class="message">Message ' + i + ' <button class="citation">[1]</button></div>').join('') + '</div><form><textarea aria-label="Question"></textarea><button type="submit">Send</button></form></section><section class="studio-panel"></section>';
        window.fixture = { sent: [], listeners: {}, submissions: 0, citations: 0 };
        document.querySelector('form').addEventListener('submit', (event) => { event.preventDefault(); fixture.submissions++; });
        document.querySelectorAll('.citation').forEach((button) => button.addEventListener('click', () => fixture.citations++));
        const sources = ${JSON.stringify(sources)};
        const assets = ${JSON.stringify(assets)};
        const modules = {};
        const ipcRenderer = {
          on: (name, callback) => { fixture.listeners[name] = callback; },
          send: (...args) => fixture.sent.push(args),
          invoke: async (name) => name === 'demo-get-app-version' ? '0.1.16' : null
        };
        function load(name) {
          if (name === 'electron') return { ipcRenderer };
          if (name === 'node:fs') return { readFileSync: (file) => ({ toString: () => assets[file.split('/').pop()] }) };
          if (name === 'node:path') return { join: (...parts) => parts.join('/') };
          const key = name.replace('./', '') + '.js';
          if (modules[key]) return modules[key].exports;
          const module = { exports: {} }; modules[key] = module;
          new Function('require', 'module', 'exports', '__dirname', sources[key])(load, module, module.exports, '.');
          if (key === 'source-config.js') module.exports.isSourceLocation = () => true;
          return module.exports;
        }
        load('./preload');
        if (window.__demoPreloadError) throw new Error(window.__demoPreloadError);
      })()`);
      for (const [width, height] of [[1440, 1000], [1280, 720], [1920, 1080], [1100, 700]]) {
        await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
        await delay(250);
        for (const key of ["architect", "dip", "gare"]) {
          await evaluate(`document.querySelector('[data-notebook-key="${key}"]').click()`);
          await delay(200);
          for (const scrollTop of [0, 500, 10000]) {
            const geometry = await evaluate(`(() => {
              const chat = document.querySelector('.conversation'); chat.scrollTop = ${scrollTop};
              const rect = (selector) => { const r = document.querySelector(selector).getBoundingClientRect(); return { top:r.top, bottom:r.bottom, left:r.left, right:r.right, height:r.height }; };
              const top = rect('#demo-top-mask'), hero = rect('#demo-card-mask'), content = rect('.conversation'), form = rect('form');
              const hit = document.elementFromPoint(hero.left + 20, hero.top + 10);
              return { top, hero, content, form, title:document.querySelector('.demo-hero-copy h2').textContent, covered:!!hit.closest('#demo-card-mask'), scrollTop:chat.scrollTop };
            })()`);
            const label = `${key} ${width}x${height} scroll=${scrollTop}`;
            assert.equal(geometry.hero.top, geometry.top.bottom, `${label}: gap above banner`);
            assert.ok(geometry.content.top >= geometry.hero.bottom, `${label}: conversation scrolls behind banner`);
            assert.ok(geometry.content.height >= 150, `${label}: insufficient conversation space`);
            assert.ok(geometry.form.top >= geometry.hero.bottom, `${label}: input covered`);
            assert.ok(geometry.form.bottom <= height, `${label}: input clipped`);
            assert.ok(geometry.covered, `${label}: banner is not opaque to input`);
            assert.equal(geometry.title, { architect:"InAR - Progetti", dip:"InAR AI - DIP", gare:"InAR - Gare" }[key]);
          }
          // Pointer-level wheel input must scroll only the exposed conversation.
          const before = await evaluate(`document.querySelector('.conversation').scrollTop = 300; 300`);
          const heroPoint = await evaluate(`(() => { const r = document.querySelector('#demo-card-mask').getBoundingClientRect(); return { x:r.left+30, y:r.top+20 }; })()`);
          await send("Input.dispatchMouseEvent", { type:"mouseWheel", ...heroPoint, deltaX:0, deltaY:200 });
          await delay(100);
          assert.equal(await evaluate(`document.querySelector('.conversation').scrollTop`), before, "wheel over banner leaked into chat");
          const chatPoint = await evaluate(`(() => { const r = document.querySelector('.conversation').getBoundingClientRect(); return { x:r.left+30, y:r.top+30 }; })()`);
          await send("Input.dispatchMouseEvent", { type:"mouseWheel", ...chatPoint, deltaX:0, deltaY:200 });
          await delay(150);
          assert.ok(await evaluate(`document.querySelector('.conversation').scrollTop > 300`), "chat wheel blocked");
          assert.ok(await evaluate(`(() => {
            document.querySelector('.conversation').scrollTop=0;
            return ['.citation', 'textarea', 'button[type="submit"]'].every((selector) => {
              const node = document.querySelector(selector), r = node.getBoundingClientRect();
              return document.elementFromPoint(r.left+r.width/2, r.top+r.height/2) === node;
            });
          })()`), "source or input controls intercepted by overlay");
          await evaluate(`document.querySelector('.citation').click(); document.querySelector('textarea').value='Test'; document.querySelector('form').requestSubmit()`);
          console.log(`PASS ${key}: ${width}x${height}, scroll, wheel, sources and input`);
        }
      }
      assert.equal(await evaluate(`fixture.submissions`), 12);
      assert.equal(await evaluate(`fixture.citations`), 12);
      assert.ok(await evaluate(`!!document.querySelector('.demo-update-button') && !!document.querySelector('.demo-version-badge')`), "update controls missing");
      // Synthetic fixture only: capture an artifact without touching any visible window.
      const capture = await send("Page.captureScreenshot", { format:"png" });
      const output = path.join(__dirname, "..", "output", "playwright");
      fs.mkdirSync(output, { recursive:true });
      fs.writeFileSync(path.join(output, "chat-layout.png"), Buffer.from(capture.data, "base64"));
      console.log("PASS: all layout checks (synthetic source DOM; installed app untouched)");
    } finally {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    await send("Browser.close");
  } finally {
    socket?.close();
    // Terminate only the isolated process launched by this check, never other apps.
    if (browser.exitCode === null) browser.kill();
    console.log(`Isolated test profile: ${profile}`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
