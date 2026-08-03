const { ipcRenderer } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { isSourceLocation } = require("./source-config");

const inarLogoPath = path.join(__dirname, "..", "assets", "inar-logo-full.webp");
const inarLogoUrl = `data:image/webp;base64,${fs.readFileSync(inarLogoPath).toString("base64")}`;
const blueprintPath = path.join(__dirname, "..", "assets", "inar-hospital-blueprint.png");
const blueprintUrl = `data:image/png;base64,${fs.readFileSync(blueprintPath).toString("base64")}`;
const logoUrl = inarLogoUrl;
const logoFullUrl = inarLogoUrl;
const wordmarkUrl = inarLogoUrl;
const chemmaLogoUrl = inarLogoUrl;

const css = `
  :root {
    --demo-chat-width: 838px;
    --demo-chat-left: 341px;
    --demo-left-cover-extra: 6px;
    --demo-chat-right: calc(var(--demo-chat-left) + var(--demo-chat-width));
    --demo-chat-top: 64px;
    --demo-chat-header-height: 49px;
    --demo-content-top: calc(var(--demo-chat-top) + var(--demo-chat-header-height));
    --demo-chat-bottom-cover: 24px;
    --demo-bg: #020305;
    --demo-panel: #0a0b0f;
    --demo-panel-soft: #111216;
    --demo-card: rgba(18, 19, 24, 0.92);
    --demo-card-soft: rgba(255, 255, 255, 0.045);
    --demo-text: #f6f7fb;
    --demo-muted: #a4a7b0;
    --demo-faint: #666b78;
    --demo-line: rgba(255, 255, 255, 0.095);
    --demo-blue: #2f7bff;
    --demo-blue-soft: rgba(47, 123, 255, 0.18);
    --demo-green: #19c37d;
  }

  #demo-ai-shell,
  #demo-ai-shell * {
    box-sizing: border-box;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    letter-spacing: 0;
  }

  #demo-ai-shell {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    pointer-events: none;
    color: var(--demo-text);
  }

  .demo-mask {
    position: fixed;
    pointer-events: auto;
    color: var(--demo-text);
  }

  #demo-top-mask {
    top: 0;
    left: 0;
    right: 0;
    height: var(--demo-chat-top);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 22px 0 calc(var(--demo-chat-left) + 24px);
    border-bottom: 1px solid var(--demo-line);
    background: #020305;
  }

  .demo-top-logo {
    width: 48px;
    height: 48px;
    display: block;
    object-fit: contain;
    filter: drop-shadow(0 0 22px rgba(47, 123, 255, 0.48));
  }

  .demo-top-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #d7d9df;
  }

  .demo-update-button {
    height: 34px;
    min-width: 142px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 8px;
    padding: 0 13px;
    color: #e9edf7;
    background: rgba(255, 255, 255, 0.06);
    cursor: pointer;
    font-size: 12px;
    font-weight: 760;
  }

  .demo-update-button:hover {
    border-color: rgba(47, 123, 255, 0.5);
    background: rgba(47, 123, 255, 0.14);
  }

  .demo-update-button:disabled {
    cursor: default;
    opacity: 0.88;
  }

  .demo-version-badge {
    height: 28px;
    display: grid;
    place-items: center;
    padding: 0 4px;
    color: #aeb7c9;
    font-size: 11px;
    font-weight: 760;
    font-variant-numeric: tabular-nums;
  }

  .demo-protected-badge {
    height: 36px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 8px;
    padding: 0 13px;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: #eef2fb;
    background: rgba(255, 255, 255, 0.055);
    font-size: 12px;
    font-weight: 720;
  }

  .demo-protected-icon {
    width: 19px;
    height: 21px;
    display: inline-grid;
    place-items: center;
    color: #d9dce2;
    filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.5));
  }

  .demo-protected-icon svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  #demo-update-overlay {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: grid;
    place-items: center;
    pointer-events: auto;
    background:
      radial-gradient(circle at 50% 34%, rgba(47, 123, 255, 0.18), rgba(47, 123, 255, 0) 28%),
      rgba(2, 3, 5, 0.98);
    color: var(--demo-text);
  }

  .demo-update-overlay-panel {
    display: grid;
    justify-items: center;
    gap: 14px;
    text-align: center;
  }

  .demo-update-spinner {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.14);
    border-top-color: #4f8dff;
    animation: demo-spin 0.9s linear infinite;
  }

  .demo-update-overlay-title {
    font-size: 18px;
    font-weight: 820;
  }

  .demo-update-overlay-message {
    max-width: 420px;
    color: #aeb7c9;
    font-size: 13px;
    line-height: 1.5;
  }

  @keyframes demo-spin {
    to {
      transform: rotate(360deg);
    }
  }

  #demo-left-mask {
    top: 0;
    left: 0;
    bottom: 0;
    width: calc(var(--demo-chat-left) + var(--demo-left-cover-extra));
    padding: 24px 18px 18px;
    border-right: 1px solid var(--demo-line);
    background:
      radial-gradient(circle at 18% 6%, rgba(47, 123, 255, 0.16), rgba(47, 123, 255, 0) 22%),
      linear-gradient(180deg, #050608 0%, #020305 100%);
  }

  .demo-sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: 0;
  }

  .demo-brand {
    display: flex;
    align-items: center;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.055);
  }

  .demo-brand-logo {
    width: 68px;
    height: 68px;
    display: block;
    object-fit: contain;
    filter: drop-shadow(0 0 24px rgba(47, 123, 255, 0.42));
  }

  .demo-brand-logo-full {
    display: block;
    width: min(305px, 100%);
    height: 118px;
    object-fit: contain;
    object-position: left center;
    filter: drop-shadow(0 0 24px rgba(47, 123, 255, 0.34));
  }

  .demo-section-label {
    margin: 0 0 10px;
    color: #7d818c;
    font-size: 10px;
    font-weight: 740;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .demo-nav,
  .demo-client-list {
    display: grid;
    gap: 6px;
  }

  .demo-client-section {
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .demo-client-list {
    min-height: 0;
    overflow-y: auto;
    padding-right: 5px;
    scrollbar-width: thin;
    scrollbar-color: rgba(47, 123, 255, 0.46) rgba(255, 255, 255, 0.04);
  }

  .demo-client-list::-webkit-scrollbar {
    width: 7px;
  }

  .demo-client-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.035);
    border-radius: 999px;
  }

  .demo-client-list::-webkit-scrollbar-thumb {
    background: rgba(47, 123, 255, 0.45);
    border-radius: 999px;
  }

  .demo-nav-button,
  .demo-client-button {
    position: relative;
    width: 100%;
    border: 0;
    border-radius: 7px;
    color: #c9ccd5;
    background: transparent;
    cursor: pointer;
    text-align: left;
    overflow: hidden;
    transition:
      transform 180ms ease,
      color 180ms ease,
      background 180ms ease,
      box-shadow 180ms ease;
  }

  .demo-nav-button::before,
  .demo-client-button::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0;
    background:
      linear-gradient(90deg, rgba(47, 123, 255, 0.18), rgba(47, 123, 255, 0.025) 52%, transparent);
    transform: translateX(-18px);
    transition: opacity 180ms ease, transform 220ms ease;
  }

  .demo-nav-button::after,
  .demo-client-button::after {
    content: "";
    position: absolute;
    left: 0;
    top: 9px;
    bottom: 9px;
    width: 3px;
    border-radius: 999px;
    opacity: 0;
    background: linear-gradient(180deg, #6fa0ff, #2f7bff);
    box-shadow: 0 0 18px rgba(47, 123, 255, 0.75);
    transform: scaleY(0.35);
    transition: opacity 180ms ease, transform 220ms ease;
  }

  .demo-nav-button:hover,
  .demo-client-button:hover {
    transform: translateX(4px);
    color: #fff;
    background: rgba(255, 255, 255, 0.045);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.055),
      0 12px 30px rgba(0, 0, 0, 0.24);
  }

  .demo-nav-button:hover::before,
  .demo-client-button:hover::before {
    opacity: 1;
    transform: translateX(0);
  }

  .demo-nav-button:hover::after,
  .demo-client-button:hover::after,
  .demo-nav-button.is-active::after,
  .demo-client-button.is-active::after {
    opacity: 1;
    transform: scaleY(1);
  }

  .demo-nav-button {
    height: 41px;
    display: grid;
    grid-template-columns: 30px 1fr;
    align-items: center;
    gap: 10px;
    padding: 0 10px;
    font-size: 13px;
    font-weight: 560;
  }

  .demo-nav-button.is-active,
  .demo-client-button.is-active {
    background: rgba(255, 255, 255, 0.075);
    color: #fff;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  }

  .demo-nav-icon {
    position: relative;
    z-index: 1;
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    color: currentColor;
    transition: transform 180ms ease, color 180ms ease, filter 180ms ease;
  }

  .demo-nav-button span:not(.demo-nav-icon),
  .demo-client-button span {
    position: relative;
    z-index: 1;
  }

  .demo-nav-button:hover .demo-nav-icon {
    color: #83a8ff;
    filter: drop-shadow(0 0 10px rgba(47, 123, 255, 0.62));
    transform: scale(1.08);
  }

  .demo-client-button {
    height: 50px;
    display: grid;
    grid-template-columns: 82px 1fr 18px;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
    font-size: 13px;
  }

  .demo-client-code {
    height: 22px;
    border-radius: 5px;
    display: grid;
    place-items: center;
    color: #fff;
    font-size: 9px;
    font-weight: 800;
  }

  .demo-client-code.is-blue { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
  .demo-client-code.is-violet { background: linear-gradient(135deg, #6d5dfc, #4c1d95); }

  .demo-client-logo {
    width: 82px;
    height: 34px;
    display: block;
    object-fit: contain;
    object-position: left center;
    filter: drop-shadow(0 0 14px rgba(47, 123, 255, 0.22));
  }

  .demo-client-private {
    position: relative;
    z-index: 1;
    width: 76px;
    height: 28px;
    border-radius: 999px;
    display: inline-grid;
    place-items: center;
    color: #c8d2e8;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.06);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.08em;
    transition:
      border-color 180ms ease,
      color 180ms ease,
      background 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
  }

  .demo-client-button:hover .demo-client-private {
    color: #fff;
    border-color: rgba(47, 123, 255, 0.55);
    background: rgba(47, 123, 255, 0.16);
    box-shadow: 0 0 18px rgba(47, 123, 255, 0.22);
    transform: translateX(2px);
  }

  .demo-client-dots {
    position: relative;
    z-index: 1;
    color: #7d818c;
    text-align: right;
    font-size: 18px;
    line-height: 1;
    transition: color 180ms ease, transform 180ms ease;
  }

  .demo-client-button:hover .demo-client-dots {
    color: #dfe6f7;
    transform: translateX(-2px) scale(1.08);
  }

  .demo-footer-note {
    margin-top: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.055);
    padding-top: 14px;
    flex: 0 0 auto;
    color: #777c88;
    font-size: 10px;
    line-height: 1.45;
  }

  .demo-back-button {
    width: fit-content;
    height: 36px;
    border: 1px solid rgba(255, 255, 255, 0.095);
    border-radius: 8px;
    padding: 0 13px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #dfe3eb;
    background: rgba(255, 255, 255, 0.055);
    cursor: pointer;
    font-size: 12px;
    font-weight: 680;
  }

  .demo-chat-context {
    border: 1px solid rgba(255, 255, 255, 0.095);
    border-radius: 9px;
    padding: 14px;
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
  }

  .demo-chat-context strong {
    display: block;
    color: #fff;
    font-size: 14px;
    line-height: 1.25;
  }

  .demo-chat-context span {
    display: block;
    margin-top: 4px;
    color: #8f95a3;
    font-size: 10px;
    line-height: 1.3;
  }

  #demo-card-mask {
    position: fixed;
    top: var(--demo-content-top);
    left: calc(var(--demo-chat-left) + var(--demo-left-cover-extra));
    width: calc(var(--demo-chat-width) - var(--demo-left-cover-extra));
    height: 248px;
    background: #202428;
    pointer-events: auto;
    padding: 0;
  }

  .demo-hero-card {
    position: relative;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    display: block;
    background:
      radial-gradient(circle at 78% 52%, rgba(47, 123, 255, 0.34), rgba(47, 123, 255, 0) 30%),
      linear-gradient(135deg, #111318, #0a0b0f);
    border: 1px solid rgba(255, 255, 255, 0.095);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.055);
  }

  .demo-hero-copy {
    position: relative;
    z-index: 2;
    width: 58%;
    height: 100%;
    padding: 28px 30px;
    display: grid;
    align-content: center;
    gap: 12px;
    background: linear-gradient(90deg, rgba(8, 10, 14, 0.97) 0%, rgba(8, 10, 14, 0.9) 62%, rgba(8, 10, 14, 0) 100%);
  }

  .demo-hero-copy h2 {
    margin: 0;
    color: #fff;
    font-size: 25px;
    line-height: 1.1;
    font-weight: 790;
  }

  .demo-hero-copy p {
    margin: 0;
    max-width: 390px;
    color: #c3c7d0;
    font-size: 13px;
    line-height: 1.45;
  }

  .demo-status-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 5px;
    color: #b8bcc6;
    font-size: 11px;
  }

  .demo-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--demo-green);
    box-shadow: 0 0 16px rgba(25, 195, 125, 0.7);
  }

  .demo-status-pill {
    height: 22px;
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 0 10px;
    color: #fff;
    border: 1px solid var(--demo-line);
    background: rgba(255, 255, 255, 0.035);
    font-size: 10px;
    font-weight: 650;
  }

  .demo-hero-visual {
    position: absolute;
    z-index: 1;
    inset: 0;
    display: grid;
    place-items: center;
    overflow: hidden;
    background: #0b1017;
  }

  .demo-blueprint-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center 48%;
    opacity: 0.94;
    filter: brightness(0.84) contrast(1.1) saturate(0.68);
  }

  .demo-hero-visual::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(90deg, rgba(8, 10, 14, 0.74) 0%, rgba(8, 10, 14, 0.22) 43%, rgba(8, 10, 14, 0) 68%),
      linear-gradient(180deg, rgba(3, 5, 8, 0.04), rgba(3, 5, 8, 0.28));
  }

  .demo-orbit {
    width: 220px;
    height: 150px;
    border-radius: 50%;
    border: 1px solid rgba(47, 123, 255, 0.2);
    position: relative;
  }

  .demo-orbit::before {
    content: "";
    position: absolute;
    left: 34px;
    top: 18px;
    width: 118px;
    height: 118px;
    border-radius: 50%;
    border: 18px solid var(--demo-blue);
    border-right-color: transparent;
    filter: drop-shadow(0 0 22px rgba(47, 123, 255, 0.4));
  }

  .demo-node-map {
    position: absolute;
    right: 30px;
    top: 56px;
    width: 92px;
    height: 52px;
    background:
      radial-gradient(circle, #2f7bff 0 5px, transparent 5px) 0 0 / 22px 22px;
  }

  #demo-right-mask {
    top: var(--demo-chat-top);
    right: 0;
    bottom: 0;
    width: calc(100vw - var(--demo-chat-right));
    display: grid;
    place-items: center;
    padding: 18px;
    background:
      radial-gradient(circle at 55% 50%, rgba(47, 123, 255, 0.16), rgba(47, 123, 255, 0) 18%),
      #020305;
    border-left: 1px solid var(--demo-line);
  }

  #demo-bottom-mask {
    left: calc(var(--demo-chat-left) + var(--demo-left-cover-extra));
    right: calc(100vw - var(--demo-chat-right));
    bottom: 0;
    height: var(--demo-chat-bottom-cover);
    background: #020305;
  }

  #demo-safe-frame,
  #demo-dots-click-window {
    position: fixed;
    pointer-events: none;
  }

  #demo-safe-frame {
    top: var(--demo-chat-top);
    left: calc(var(--demo-chat-left) + var(--demo-left-cover-extra));
    width: calc(var(--demo-chat-width) - var(--demo-left-cover-extra));
    bottom: var(--demo-chat-bottom-cover);
    border-left: 1px solid rgba(47, 123, 255, 0.32);
    border-right: 1px solid rgba(47, 123, 255, 0.32);
  }

  #demo-dots-click-window {
    top: var(--demo-chat-top);
    left: calc(var(--demo-chat-right) - 74px);
    width: 62px;
    height: var(--demo-chat-header-height);
  }

  #demo-module-view {
    position: fixed;
    top: var(--demo-chat-top);
    left: calc(var(--demo-chat-left) + var(--demo-left-cover-extra));
    right: 0;
    bottom: var(--demo-chat-bottom-cover);
    z-index: 2;
    display: none;
    pointer-events: auto;
    overflow: auto;
    color: var(--demo-text);
    background:
      radial-gradient(circle at 74% 18%, rgba(47, 123, 255, 0.14), transparent 24%),
      #020305;
    border-left: 1px solid rgba(47, 123, 255, 0.32);
  }

  .demo-company-mark {
    width: 148px;
    height: 148px;
    border-radius: 26px;
    display: grid;
    place-items: center;
    color: #fff;
    font-size: 40px;
    font-weight: 860;
    letter-spacing: 0.03em;
    border: 1px solid rgba(255, 255, 255, 0.13);
    box-shadow: 0 0 46px rgba(47, 123, 255, 0.32);
  }

  .demo-company-mark.is-chemical {
    background:
      radial-gradient(circle at 28% 22%, rgba(255, 255, 255, 0.22), transparent 24%),
      linear-gradient(135deg, #2563eb, #0f3fb2);
  }

  .demo-company-mark.is-architect {
    background:
      radial-gradient(circle at 28% 22%, rgba(255, 255, 255, 0.22), transparent 24%),
      linear-gradient(135deg, #7c5cff, #4c1d95);
  }

  .demo-company-logo {
    width: min(230px, 88%);
    max-height: 154px;
    display: block;
    object-fit: contain;
    filter: drop-shadow(0 0 36px rgba(47, 123, 255, 0.38));
  }

  .demo-hero-logo {
    width: min(350px, 88%);
    max-height: 170px;
    object-fit: contain;
    filter: drop-shadow(0 0 34px rgba(47, 123, 255, 0.44));
  }

  #demo-module-view.is-visible {
    display: block;
  }

  .demo-page {
    min-height: 100%;
    padding: 28px 42px 34px;
    max-width: 1180px;
  }

  .demo-page h1 {
    margin: 0;
    color: #fff;
    font-size: 34px;
    line-height: 1.05;
    font-weight: 790;
  }

  .demo-page h1 span {
    display: block;
    margin-top: 7px;
    color: #8d9099;
    font-weight: 700;
  }

  .demo-page p {
    margin: 14px 0 0;
    max-width: 720px;
    color: #b8bcc6;
    font-size: 15px;
    line-height: 1.55;
  }

  .demo-dashboard {
    padding-top: 22px;
  }

  .demo-dashboard-kicker {
    margin: 0 0 8px;
    color: #7f9bff;
    font-size: 11px;
    font-weight: 820;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .demo-dashboard h1 {
    max-width: 920px;
    font-size: 36px;
  }

  .demo-dashboard h1 span {
    display: inline;
    color: #5f86ff;
  }

  .demo-dashboard-intro {
    margin-top: 12px;
    max-width: 860px;
    font-size: 16px;
    line-height: 1.5;
  }

  .demo-dashboard-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 22px;
  }

  .demo-feature-card {
    min-height: 190px;
    border: 1px solid var(--demo-line);
    border-radius: 8px;
    padding: 18px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.025));
  }

  .demo-feature-head {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 13px;
    align-items: center;
    margin-bottom: 16px;
  }

  .demo-feature-icon {
    width: 48px;
    height: 48px;
    border: 1px solid rgba(47, 123, 255, 0.55);
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #82a5ff;
    background: rgba(47, 123, 255, 0.09);
    font-size: 21px;
  }

  .demo-feature-card strong {
    display: block;
    color: #fff;
    font-size: 17px;
    line-height: 1.2;
  }

  .demo-feature-card ul,
  .demo-answer-rules ul {
    margin: 0;
    padding: 0;
    display: grid;
    gap: 9px;
    list-style: none;
  }

  .demo-feature-card li,
  .demo-answer-rules li {
    position: relative;
    padding-left: 21px;
    color: #c4c9d4;
    font-size: 13px;
    line-height: 1.35;
  }

  .demo-feature-card li::before,
  .demo-answer-rules li::before {
    content: "✓";
    position: absolute;
    left: 0;
    top: 0;
    color: #4c8dff;
    font-weight: 900;
  }

  .demo-answer-strip {
    margin-top: 14px;
    border: 1px solid var(--demo-line);
    border-radius: 8px;
    padding: 16px;
    display: grid;
    grid-template-columns: 1.05fr 1.4fr;
    gap: 16px;
    background: rgba(255, 255, 255, 0.04);
  }

  .demo-answer-strip h2,
  .demo-flow-section h2 {
    margin: 0;
    color: #fff;
    font-size: 20px;
    line-height: 1.2;
  }

  .demo-answer-strip p {
    margin-top: 7px;
    color: #aeb4c0;
    font-size: 13px;
    line-height: 1.42;
  }

  .demo-answer-rules {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .demo-answer-rule {
    border-left: 1px solid rgba(255, 255, 255, 0.12);
    padding-left: 14px;
  }

  .demo-answer-rule strong {
    display: block;
    color: #f4f6fb;
    font-size: 13px;
  }

  .demo-answer-rule span {
    display: block;
    margin-top: 5px;
    color: #9ba2af;
    font-size: 12px;
    line-height: 1.35;
  }

  .demo-flow-section {
    margin-top: 14px;
    border: 1px solid var(--demo-line);
    border-radius: 8px;
    padding: 18px;
    background: rgba(255, 255, 255, 0.032);
  }

  .demo-flow-section > p {
    margin-top: 7px;
    max-width: 780px;
    color: #aeb4c0;
    font-size: 13px;
  }

  .demo-flow-list {
    margin-top: 16px;
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    overflow: hidden;
  }

  .demo-flow-list::before {
    content: "";
    position: absolute;
    left: 30px;
    top: 22px;
    bottom: 43px;
    width: 2px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.09);
  }

  .demo-flow-list::after {
    content: "";
    position: absolute;
    left: 30px;
    top: 22px;
    width: 2px;
    height: 118px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(47, 123, 255, 0), rgba(47, 123, 255, 0.95), rgba(25, 195, 125, 0));
    box-shadow: 0 0 24px rgba(47, 123, 255, 0.65);
    animation: demo-flow-pulse 4.2s linear infinite;
    will-change: transform, opacity;
  }

  @keyframes demo-flow-pulse {
    0% { transform: translateY(-118px); opacity: 0; }
    10% { opacity: 1; }
    88% { opacity: 1; }
    100% { transform: translateY(498px); opacity: 0; }
  }

  .demo-flow-step {
    position: relative;
    min-height: 86px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 8px;
    padding: 13px 16px 13px 76px;
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    background: rgba(255, 255, 255, 0.035);
    overflow: hidden;
  }

  .demo-flow-step::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(90deg, rgba(47, 123, 255, 0.13), transparent 26%);
    opacity: 0;
    animation: demo-step-glow 7.2s ease-in-out infinite;
  }

  .demo-flow-step:nth-child(2)::after { animation-delay: 1.2s; }
  .demo-flow-step:nth-child(3)::after { animation-delay: 2.4s; }
  .demo-flow-step:nth-child(4)::after { animation-delay: 3.6s; }
  .demo-flow-step:nth-child(5)::after { animation-delay: 4.8s; }
  .demo-flow-step:nth-child(6)::after { animation-delay: 6s; }

  @keyframes demo-step-glow {
    0%, 14%, 100% { opacity: 0; }
    5%, 10% { opacity: 1; }
  }

  .demo-flow-number {
    position: absolute;
    left: 12px;
    top: 50%;
    z-index: 1;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: rgba(47, 123, 255, 0.18);
    border: 1px solid rgba(47, 123, 255, 0.45);
    font-size: 13px;
    font-weight: 850;
    line-height: 1;
    transform: translateY(-50%);
    box-shadow: 0 0 0 7px #080a0f;
  }

  .demo-flow-step strong {
    position: relative;
    z-index: 1;
    display: block;
    color: #fff;
    font-size: 15px;
    line-height: 1.25;
  }

  .demo-flow-copy {
    position: relative;
    z-index: 1;
    display: block;
    margin-top: 6px;
    color: #aab1bd;
    font-size: 13px;
    line-height: 1.38;
  }

  .demo-info-card {
    border: 1px solid var(--demo-line);
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.045);
    color: #e5e7ec;
  }

  .demo-card-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 28px;
  }

  .demo-info-card {
    padding: 16px;
  }

  .demo-info-card strong {
    display: block;
    color: #fff;
    font-size: 13px;
    line-height: 1.25;
  }

  .demo-info-card span {
    display: block;
    margin-top: 8px;
    color: #a9adb7;
    font-size: 12px;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .demo-question-box {
    margin-top: 30px;
    min-height: 92px;
    border: 1px solid var(--demo-line);
    border-radius: 8px;
    display: grid;
    grid-template-columns: 1fr 52px;
    align-items: center;
    padding: 18px 22px;
    color: #8f939e;
    background: rgba(255, 255, 255, 0.04);
    font-size: 14px;
  }

  .demo-send {
    width: 44px;
    height: 44px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

`;

const icon = {
  grid: "▦",
  chat: "○",
  doc: "▤",
  list: "☷",
  help: "?",
  gear: "⚙",
  search: "⌕",
  bell: "!",
  send: "➤"
};

const moduleContent = {};

const demoInfo = {
  architect: {
    label: "InAR AI",
    code: "IN",
    logoUrl: inarLogoUrl,
    logoAlt: "INAR",
    className: "is-architect",
    title: "Assistente AI InAR",
    description: "Consulta progetti, capitolati, materiali, procedure interne e documentazione tecnica."
  }
};

function mountOverlay() {
  try {
    if (!isSourceLocation(window.location)) return;
    if (!document.documentElement) return;
    if (document.getElementById("demo-ai-shell")) return;
    ensureInitialState();

    if (!document.getElementById("demo-ai-style")) {
      const style = document.createElement("style");
      style.id = "demo-ai-style";
      style.textContent = css;
      document.documentElement.appendChild(style);
    }

    const shell = createNode("div", { id: "demo-ai-shell" });

    shell.append(
      createTopMask(),
      createNode("aside", { id: "demo-left-mask", className: "demo-mask" }, [createSidebar()]),
      createNode("aside", { id: "demo-right-mask", className: "demo-mask" }),
      createHeroCard(),
      createNode("div", { id: "demo-bottom-mask", className: "demo-mask" }),
      createNode("div", { id: "demo-safe-frame" }),
      createNode("div", { id: "demo-dots-click-window" }),
      createModuleView()
    );

    document.documentElement.appendChild(shell);
    restoreUpdateOverlayIfNeeded(shell);
    updateSourceLayoutVars();
  } catch (error) {
    window.__demoPreloadError = `${error?.name || "Error"}: ${error?.message || error}`;
  }
}

function ensureInitialState() {
  if (sessionStorage.getItem("demo-window-initialized") === "1") return;

  sessionStorage.setItem("demo-window-initialized", "1");
  sessionStorage.setItem("demo-active-view", "Chat");
  sessionStorage.setItem("demo-active-client", "architect");
}

function createTopMask() {
  return createNode("header", { id: "demo-top-mask", className: "demo-mask" }, [
    createNode("div", { className: "demo-top-actions" }, [
      createUpdateButton(),
      createVersionBadge(),
      createProtectedBadge()
    ])
  ]);
}

function createProtectedBadge() {
  const icon = createNode("span", { className: "demo-protected-icon" });
  const svgNamespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("viewBox", "0 0 24 27");
  svg.setAttribute("aria-hidden", "true");

  const shield = document.createElementNS(svgNamespace, "path");
  shield.setAttribute("d", "M12 1.8 21 5.4v7.1c0 5.7-3.5 10.2-9 12.7-5.5-2.5-9-7-9-12.7V5.4L12 1.8Z");
  shield.setAttribute("fill", "rgba(255,255,255,0.025)");
  shield.setAttribute("stroke", "#bfc3cb");
  shield.setAttribute("stroke-width", "1.55");

  const check = document.createElementNS(svgNamespace, "path");
  check.setAttribute("d", "m8.1 13.3 2.45 2.4 5.2-5.45");
  check.setAttribute("fill", "none");
  check.setAttribute("stroke", "#a8c3aa");
  check.setAttribute("stroke-width", "1.65");
  check.setAttribute("stroke-linecap", "round");
  check.setAttribute("stroke-linejoin", "round");

  svg.append(shield, check);
  icon.appendChild(svg);

  return createNode("div", { className: "demo-protected-badge" }, [
    icon,
    createNode("span", { text: "Area protetta" })
  ]);
}

function createVersionBadge() {
  const badge = createNode("div", { className: "demo-version-badge", text: "v..." });

  ipcRenderer.invoke("demo-get-app-version")
    .then((version) => {
      badge.textContent = version ? `v${version}` : "v-";
    })
    .catch(() => {
      badge.textContent = "v-";
    });

  return badge;
}

function createUpdateButton() {
  const button = createNode("button", { className: "demo-update-button", text: "Verifica aggiornamenti" });
  button.type = "button";

  const state = {
    mode: "check",
    latestVersion: ""
  };

  const setUpdateAvailable = (version, message, showOverlay = false) => {
    state.mode = "download";
    state.latestVersion = version || state.latestVersion;
    button.textContent = `Aggiorna a v${state.latestVersion}`;
    button.disabled = false;
    if (showOverlay) {
      showUpdateOverlay(message || `Ultima versione: v${state.latestVersion}. Premi Aggiorna per scaricarla.`, 7000);
    }
  };

  button.addEventListener("click", async () => {
    if (state.mode === "install") {
      button.disabled = true;
      button.textContent = "Riavvio...";
      showUpdateOverlay("Riavvio e installazione aggiornamento...", 10000);
      await ipcRenderer.invoke("demo-install-update");
      return;
    }

    try {
      button.disabled = true;

      if (state.mode === "download") {
        button.textContent = "Download 0%";
        showUpdateOverlay(`Download aggiornamento v${state.latestVersion} in corso...`, 10000);
        const result = await ipcRenderer.invoke("demo-download-update");
        if (!result?.ok) {
          throw new Error(result?.message || "Download aggiornamento non riuscito.");
        }

        if (result.updateAvailable === false) {
          state.mode = "check";
          button.textContent = "Verifica aggiornamenti";
          showUpdateOverlay(result.message, 2600);
          button.disabled = false;
        }
        return;
      }

      button.textContent = "Verifico...";
      showUpdateOverlay("Verifico aggiornamenti...", 10000);
      const result = await ipcRenderer.invoke("demo-check-updates");
      if (!result?.ok) {
        throw new Error(result?.message || "Controllo aggiornamenti non riuscito.");
      }

      state.latestVersion = result.latestVersion || "";
      if (result.updateAvailable) {
        setUpdateAvailable(state.latestVersion, `Ultima versione: v${state.latestVersion}. Premi Aggiorna per scaricarla.`, true);
      } else {
        state.mode = "check";
        button.textContent = "Verifica aggiornamenti";
        showUpdateOverlay(result.message, 2600);
      }
      button.disabled = false;
    } catch (error) {
      state.mode = "check";
      button.textContent = "Verifica aggiornamenti";
      button.disabled = false;
      showUpdateOverlay(error?.message || "Controllo aggiornamenti non riuscito.", 3000);
    }
  });

  ipcRenderer.on("demo-update-available", (event, update) => {
    setUpdateAvailable(update?.latestVersion, update?.message, false);
  });

  ipcRenderer.on("demo-update-progress", (event, progress) => {
    const percent = Math.round(progress?.percent || 0);
    const total = formatMegabytes(progress?.total || 0);
    button.textContent = `Download ${percent}%`;
    showUpdateOverlay(
      total ? `Download aggiornamento: ${percent}% di ${total}.` : `Download aggiornamento: ${percent}%.`,
      2200
    );
  });

  ipcRenderer.on("demo-update-downloaded", (event, update) => {
    state.mode = "install";
    state.latestVersion = update?.version || state.latestVersion;
    button.textContent = "Riavvia e installa";
    button.disabled = false;
    showUpdateOverlay(`Aggiornamento v${state.latestVersion} pronto. Premi Riavvia e installa.`, 9000);
  });

  return button;
}

function formatMegabytes(bytes) {
  if (!bytes) return "";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function showUpdateOverlay(message, holdMs = 6000, shell = document.getElementById("demo-ai-shell"), variant = "full") {
  if (!shell) return;

  const until = Date.now() + holdMs;
  sessionStorage.setItem("demo-update-overlay-until", String(until));
  sessionStorage.setItem("demo-update-overlay-message", message);
  sessionStorage.setItem("demo-update-overlay-variant", variant);

  let overlay = document.getElementById("demo-update-overlay");
  if (!overlay) {
    overlay = createNode("div", { id: "demo-update-overlay" }, [
      createNode("div", { className: "demo-update-overlay-panel" }, [
        createNode("div", { className: "demo-update-spinner" }),
        createNode("div", { className: "demo-update-overlay-title", text: "Aggiornamento in corso" }),
        createNode("div", { className: "demo-update-overlay-message", text: message })
      ])
    ]);
    shell.appendChild(overlay);
  }

  const messageNode = overlay.querySelector(".demo-update-overlay-message");
  if (messageNode) messageNode.textContent = message;

  window.clearTimeout(showUpdateOverlay.timeoutId);
  showUpdateOverlay.timeoutId = window.setTimeout(() => {
    if (Number(sessionStorage.getItem("demo-update-overlay-until") || 0) <= Date.now()) {
      sessionStorage.removeItem("demo-update-overlay-until");
      sessionStorage.removeItem("demo-update-overlay-message");
      sessionStorage.removeItem("demo-update-overlay-variant");
      overlay.remove();
    }
  }, holdMs);
}

function restoreUpdateOverlayIfNeeded(shell) {
  const until = Number(sessionStorage.getItem("demo-update-overlay-until") || 0);
  const remainingMs = until - Date.now();
  if (remainingMs > 0) {
    showUpdateOverlay(
      sessionStorage.getItem("demo-update-overlay-message") || "Aggiornamento in corso...",
      remainingMs,
      shell,
      sessionStorage.getItem("demo-update-overlay-variant") || "full"
    );
  }
}

ipcRenderer.on("demo-update-status", (event, status) => {
  showUpdateOverlay(status?.message || "Aggiornamento in corso...", status?.holdMs || 6000);
});

function createSidebar() {
  const activeView = getActiveView();
  const activeClient = getActiveClient();
  const brand = createNode("div", { className: "demo-brand" }, [
    createNode("img", { className: "demo-brand-logo-full", src: wordmarkUrl, alt: "InAR AI" })
  ]);

  if (activeView === "Chat") {
    return createNode("div", { className: "demo-sidebar" }, [
      brand,
      createChatContext(activeClient)
    ]);
  }

  return createNode("div", { className: "demo-sidebar" }, [
    brand,
    createNode("div", {}, [
      createNode("div", { className: "demo-section-label", text: "Navigazione" }),
      createNode("nav", { className: "demo-nav" }, [
        createNavButton("Dashboard", icon.grid, activeView === "Dashboard"),
        createNavButton("Chat", icon.chat, activeView === "Chat" && activeClient === "general"),
        createNavButton("Impostazioni", icon.gear, activeView === "Impostazioni")
      ])
    ]),
    createNode("div", { className: "demo-client-section" }, [
      createNode("div", { className: "demo-section-label", text: "Demo Clienti" }),
      createNode("div", { className: "demo-client-list" }, [
        createClientButton("chemical", activeView === "Chat" && activeClient === "chemical"),
        createClientButton("architect", activeView === "Chat" && activeClient === "architect"),
        createClientButton("legal", activeView === "Chat" && activeClient === "legal"),
        createClientButton("building", activeView === "Chat" && activeClient === "building"),
        createClientButton("mechanic", activeView === "Chat" && activeClient === "mechanic"),
        createClientButton("laboratory", activeView === "Chat" && activeClient === "laboratory"),
        createClientButton("assistance", activeView === "Chat" && activeClient === "assistance")
      ])
    ]),
    createNode("div", { className: "demo-footer-note", text: "Demo commerciale: mostra come una base documentale aziendale può diventare un assistente AI interrogabile." })
  ]);
}

function createBackButton() {
  const button = createNode("button", { className: "demo-back-button" }, [
    createNode("span", { text: "←" }),
    createNode("span", { text: "Torna indietro" })
  ]);

  button.type = "button";
  button.addEventListener("click", () => {
    sessionStorage.setItem("demo-active-view", "Dashboard");
    sessionStorage.setItem("demo-active-client", "general");
    rebuildShell();
  });

  return button;
}

function createChatContext(activeClient) {
  const info = demoInfo[activeClient] || demoInfo.architect;

  return createNode("section", { className: "demo-chat-context" }, [
    createNode("div", {}, [
      createNode("strong", { text: info.label }),
      createNode("span", { text: "Assistente InAR attivo" })
    ])
  ]);
}

function createNavButton(label, iconMarkup, active = false) {
  const button = createNode("button", { className: `demo-nav-button${active ? " is-active" : ""}` }, [
    createNode("span", { className: "demo-nav-icon", text: iconMarkup }),
    createNode("span", { text: label })
  ]);

  button.type = "button";
  button.addEventListener("click", () => {
    document.querySelectorAll(".demo-nav-button").forEach((item) => item.classList.remove("is-active"));
    document.querySelectorAll(".demo-client-button").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    if (label === "Chat") {
      sessionStorage.setItem("demo-active-view", "Chat");
      sessionStorage.setItem("demo-active-client", "general");
      ipcRenderer.send("demo-open", "general");
      rebuildShell();
    }

    updateModuleView(label);
  });

  return button;
}

function createClientButton(demoKey, active = false) {
  const info = demoInfo[demoKey] || demoInfo.general;
  const button = createNode("button", { className: `demo-client-button${active ? " is-active" : ""}` }, [
    createPrivateClientMark(),
    createNode("span", { text: info.label }),
    createNode("span", { className: "demo-client-dots", text: "⋮" })
  ]);

  button.type = "button";
  button.addEventListener("click", () => {
    document.querySelectorAll(".demo-nav-button").forEach((item) => item.classList.remove("is-active"));
    document.querySelectorAll(".demo-client-button").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    sessionStorage.setItem("demo-active-view", "Chat");
    sessionStorage.setItem("demo-active-client", demoKey);
    ipcRenderer.send("demo-open", demoKey);
    updateModuleView("Chat");
    rebuildShell();
  });

  return button;
}

function createPrivateClientMark() {
  return createNode("span", { className: "demo-client-private", text: "PRIVATO" });
}

function createClientMark(info, colorClass) {
  if (info.logoUrl) {
    return createNode("img", { className: "demo-client-logo", src: info.logoUrl, alt: info.logoAlt || info.label });
  }

  return createNode("span", { className: `demo-client-code ${colorClass}`, text: info.code });
}

function createHeroCard() {
  const activeClient = getActiveClient();
  const info = demoInfo[activeClient] || demoInfo.architect;
  const visual = createNode("img", { className: "demo-blueprint-image", src: blueprintUrl, alt: "" });

  return createNode("div", { id: "demo-card-mask" }, [
    createNode("section", { className: "demo-hero-card" }, [
      createNode("div", { className: "demo-hero-copy" }, [
        createNode("h2", { text: info.title }),
        createNode("p", { text: info.description }),
        createNode("div", { className: "demo-status-row" }, [
          createNode("span", { className: "demo-status-dot" }),
          createNode("span", { text: "Sistema operativo" }),
          createNode("span", { className: "demo-status-pill", text: "Online" })
        ])
      ]),
      createNode("div", { className: "demo-hero-visual" }, [
        visual
      ])
    ])
  ]);
}

function createModuleView() {
  const activeView = getActiveView();
  const content = moduleContent[activeView] || moduleContent.Dashboard;
  const view = createNode("main", { id: "demo-module-view", className: activeView === "Chat" ? "" : "is-visible" });

  if (activeView !== "Chat") {
    view.appendChild(createModulePage(content));
  }

  return view;
}

function updateModuleView(label) {
  const view = document.getElementById("demo-module-view");
  if (!view) return;

  sessionStorage.setItem("demo-active-view", label);

  if (label === "Chat") {
    view.classList.remove("is-visible");
    view.replaceChildren();
    return;
  }

  const content = moduleContent[label] || moduleContent.Dashboard;
  view.classList.add("is-visible");
  view.replaceChildren(createModulePage(content));

}

function rebuildShell() {
  const shell = document.getElementById("demo-ai-shell");
  if (shell) shell.remove();
  mountOverlay();
}

function createModulePage(content) {
  if (content.type === "dashboard") return createDashboardPage();

  return createNode("section", { className: "demo-page" }, [
    createNode("h1", {}, [
      document.createTextNode(content.title),
      createNode("span", { text: content.titleMuted })
    ]),
    createNode("p", { text: content.description }),
    createNode("div", { className: "demo-card-grid" }, content.cards.map(([title, copy]) => (
      createNode("article", { className: "demo-info-card" }, [
        createNode("strong", { text: title }),
        createNode("span", { text: copy })
      ])
    )))
  ]);
}

function createDashboardPage() {
  return createNode("section", { className: "demo-page demo-dashboard" }, [
    createNode("div", { className: "demo-dashboard-kicker", text: "Piattaforma AI interna" }),
    createNode("h1", {}, [
      document.createTextNode("La conoscenza dell'azienda, "),
      createNode("span", { text: "a portata di domanda." })
    ]),
    createNode("p", { className: "demo-dashboard-intro", text: "Il software trasforma documenti, procedure, cataloghi e know-how in un assistente AI controllato. Le risposte seguono i materiali forniti e il formato deciso dall'azienda." }),
    createNode("div", { className: "demo-dashboard-grid" }, [
      createFeatureCard("▤", "Cosa ti permette di fare", [
        "Trovare informazioni precise in pochi secondi",
        "Interrogare procedure, prodotti e normative",
        "Evitare ricerche manuali tra file, email e cartelle",
        "Ottenere risposte affidabili e contestualizzate"
      ]),
      createFeatureCard("↗", "Perché è utile", [
        "Riduce tempi di ricerca e interruzioni",
        "Migliora la qualità del lavoro quotidiano",
        "Allinea team e reparti con informazioni coerenti",
        "Valorizza il know-how e riduce errori operativi"
      ]),
      createFeatureCard("☷", "Come si presenta", [
        "Chat intuitiva in linguaggio naturale",
        "Risposte chiare, strutturate e con fonti",
        "Accesso sicuro e controllato",
        "Esperienza simile a quella di un esperto interno"
      ])
    ]),
    createNode("section", { className: "demo-answer-strip" }, [
      createNode("div", {}, [
        createNode("h2", { text: "Non solo cosa sa, ma anche come deve rispondere" }),
        createNode("p", { text: "L'assistente viene configurato per rispecchiare esigenze e stile dell'azienda: tono, formato, livello di dettaglio, struttura, limiti e riferimenti." })
      ]),
      createNode("div", { className: "demo-answer-rules" }, [
        createAnswerRule("Tono e stile", "Professionale, tecnico, semplice o personalizzato."),
        createAnswerRule("Formato risposte", "Sintetico, dettagliato, a punti, tabellare o operativo."),
        createAnswerRule("Fonti e riferimenti", "Ogni risposta può riportare le fonti utilizzate."),
        createAnswerRule("Sicurezza e limiti", "Accessi controllati e risposte nei confini definiti.")
      ])
    ]),
    createNode("section", { className: "demo-flow-section" }, [
      createNode("h2", { text: "Come funziona: dal documento alla risposta" }),
      createNode("p", { text: "Il processo rende i materiali aziendali ricercabili, coerenti e interrogabili senza cambiare il modo in cui le persone fanno domande." }),
      createNode("div", { className: "demo-flow-list" }, [
        createFlowStep("1", "L'azienda fornisce i materiali", "Documenti, procedure, cataloghi, schede tecniche, FAQ, presentazioni e contenuti utili."),
        createFlowStep("2", "Rielaborazione e formattazione", "I materiali vengono puliti, strutturati, normalizzati e arricchiti di metadati."),
        createFlowStep("3", "Indicizzazione semantica", "I contenuti vengono organizzati per argomento, concetto e relazione."),
        createFlowStep("4", "Lettura AI e collegamenti", "Il sistema comprende i documenti e collega informazioni distribuite."),
        createFlowStep("5", "Domanda dell'utente", "L'utente scrive in linguaggio naturale, come farebbe con un esperto interno."),
        createFlowStep("6", "Risposta generata dall'AI", "L'AI recupera le informazioni più pertinenti e produce una risposta chiara, coerente e verificabile.")
      ])
    ])
  ]);
}

function createFeatureCard(symbol, title, items) {
  return createNode("article", { className: "demo-feature-card" }, [
    createNode("div", { className: "demo-feature-head" }, [
      createNode("span", { className: "demo-feature-icon", text: symbol }),
      createNode("strong", { text: title })
    ]),
    createNode("ul", {}, items.map((item) => createNode("li", { text: item })))
  ]);
}

function createAnswerRule(title, copy) {
  return createNode("article", { className: "demo-answer-rule" }, [
    createNode("strong", { text: title }),
    createNode("span", { text: copy })
  ]);
}

function createFlowStep(number, title, copy) {
  return createNode("article", { className: "demo-flow-step" }, [
    createNode("span", { className: "demo-flow-number", text: number }),
    createNode("div", {}, [
      createNode("strong", { text: title }),
      createNode("span", { className: "demo-flow-copy", text: copy })
    ])
  ]);
}

function getActiveView() {
  return sessionStorage.getItem("demo-active-view") || "Chat";
}

function getActiveClient() {
  return sessionStorage.getItem("demo-active-client") || "architect";
}

function updateSourceLayoutVars() {
  const layout = detectSourceLayout();
  if (!layout) return;

  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--demo-chat-left", `${Math.round(layout.left)}px`);
  rootStyle.setProperty("--demo-chat-width", `${Math.round(layout.width)}px`);
  rootStyle.setProperty("--demo-chat-top", `${Math.round(layout.top)}px`);
  rootStyle.setProperty("--demo-chat-header-height", `${Math.round(layout.headerHeight)}px`);
}

function detectSourceLayout() {
  const chatPanel = getUsefulRect(document.querySelector("section.chat-panel"));
  const chatHeader = getUsefulRect(document.querySelector("section.chat-panel .panel-header"));

  if (chatPanel) {
    return {
      left: chatPanel.left,
      width: chatPanel.width,
      top: chatPanel.top,
      headerHeight: chatHeader?.height || 49
    };
  }

  const inferredChat = inferChatRectFromSidePanels();
  if (inferredChat) return inferredChat;

  return null;
}

function inferChatRectFromSidePanels() {
  const sourcePanel = getUsefulRect(document.querySelector("section.source-panel"));
  const studioPanel = getUsefulRect(document.querySelector("section.studio-panel"));

  if (!sourcePanel || !studioPanel) return null;

  const gap = 16;
  const left = sourcePanel.right + gap;
  const right = studioPanel.left - gap;
  const width = right - left;

  if (width < 420) return null;

  return {
    left,
    width,
    top: Math.min(sourcePanel.top, studioPanel.top),
    headerHeight: 49
  };
}

function getUsefulRect(element) {
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  return rect;
}

function scheduleSourceLayoutUpdate() {
  window.clearTimeout(scheduleSourceLayoutUpdate.timeoutId);
  scheduleSourceLayoutUpdate.timeoutId = window.setTimeout(updateSourceLayoutVars, 120);
}

function createNode(tagName, options = {}, children = []) {
  const node = document.createElement(tagName);
  if (options.id) node.id = options.id;
  if (options.className) node.className = options.className;
  if (options.text) node.textContent = options.text;
  if (options.src) node.src = options.src;
  if (options.alt) node.alt = options.alt;

  for (const child of children) {
    node.appendChild(child);
  }

  return node;
}

function keepOverlayMounted() {
  mountOverlay();
  updateSourceLayoutVars();

  if (!document.documentElement) {
    window.setTimeout(keepOverlayMounted, 50);
    return;
  }

  const observer = new MutationObserver(() => {
    if (!document.getElementById("demo-ai-shell")) mountOverlay();
    scheduleSourceLayoutUpdate();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("resize", scheduleSourceLayoutUpdate);
}

ipcRenderer.on("demo-force-overlay", () => {
  mountOverlay();
  updateSourceLayoutVars();
});

if (document.readyState === "loading") {
  keepOverlayMounted();
  window.addEventListener("DOMContentLoaded", keepOverlayMounted, { once: true });
} else {
  keepOverlayMounted();
}

for (const delay of [500, 1500, 3000, 6000, 10000]) {
  window.setTimeout(() => {
    mountOverlay();
    updateSourceLayoutVars();
  }, delay);
}



