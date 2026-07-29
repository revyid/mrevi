#!/usr/bin/env node

const https = require("https");

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const BASE_URL = "https://api.vercel.com";

if (!VERCEL_TOKEN) {
  console.error("Set VERCEL_TOKEN dulu:");
  console.error("  $env:VERCEL_TOKEN=\"your_token_here\"");
  process.exit(1);
}

function request(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        } else {
          resolve(body ? JSON.parse(body) : {});
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

// ── Interactive selector with scrolling ──

const HEADER_LINES = 4; // title + status + blank line
const FOOTER_LINES = 3; // separator + controls + blank

function getViewportSize() {
  const rows = process.stdout.rows || 24;
  return Math.max(5, rows - HEADER_LINES - FOOTER_LINES);
}

function renderList(items, cursor, checked, scroll) {
  process.stdout.write("\x1B[2J\x1B[H");

  const r = "\x1b[0m";
  const red = "\x1b[31m";
  const green = "\x1b[32m";
  const yellow = "\x1b[33m";
  const cyan = "\x1b[36m";
  const dim = "\x1b[2m";
  const bold = "\x1b[1m";

  const viewportSize = getViewportSize();
  const totalItems = items.length;

  console.log(`${bold}${cyan}=== Vercel Project Remover ===${r}`);
  console.log(`${dim}Total: ${totalItems} projects${r}`);

  const checkedCount = checked.filter(Boolean).length;
  if (checkedCount > 0) {
    console.log(`${red}${bold}>>> ${checkedCount} akan dihapus <<<${r}`);
  } else {
    console.log(`${dim}(belum ada dipilih)${r}`);
  }

  // Calculate visible range
  const end = Math.min(scroll + viewportSize, totalItems);
  const visible = items.slice(scroll, end);

  // Show scroll indicators
  if (scroll > 0) {
    console.log(`${dim}  ... ${scroll} item(s) above ...${r}`);
  }

  visible.forEach((p, vi) => {
    const i = scroll + vi;
    const cur = i === cursor;
    const chk = checked[i];
    const arrow = cur ? `${yellow}>${r}` : " ";
    const box = chk ? `${red}[x]${r}` : `${dim}[ ]${r}`;
    const name = chk ? `${red}${bold}${p.name}${r}` : p.name;
    const fw = p.framework ? ` ${dim}(${p.framework})${r}` : "";

    console.log(`${arrow} ${box} ${name}${fw}`);
  });

  if (end < totalItems) {
    console.log(`${dim}  ... ${totalItems - end} item(s) below ...${r}`);
  }

  console.log(`\n${dim}---${r}`);
  console.log(`${yellow}↑↓${r} navigate  ${yellow}space${r} toggle  ${green}enter${r} confirm  ${cyan}a${r} all  ${red}q${r} quit`);
}

async function selectProjects(projects) {
  const cursor = { value: 0 };
  const scroll = { value: 0 };
  const checked = new Array(projects.length).fill(false);

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf-8");

  renderList(projects, cursor.value, checked, scroll.value);

  return new Promise((resolve) => {
    function onKey(key) {
      if (key === "\u0003") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.exit();
      }

      if (key === "q") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve(null);
        return;
      }

      const viewportSize = getViewportSize();

      if (key === "\u001B[A") {
        // Arrow Up
        cursor.value = Math.max(0, cursor.value - 1);
        if (cursor.value < scroll.value) {
          scroll.value = cursor.value;
        }
        renderList(projects, cursor.value, checked, scroll.value);
      } else if (key === "\u001B[B") {
        // Arrow Down
        cursor.value = Math.min(projects.length - 1, cursor.value + 1);
        if (cursor.value >= scroll.value + viewportSize) {
          scroll.value = cursor.value - viewportSize + 1;
        }
        renderList(projects, cursor.value, checked, scroll.value);
      } else if (key === " ") {
        checked[cursor.value] = !checked[cursor.value];
        renderList(projects, cursor.value, checked, scroll.value);
      } else if (key === "a") {
        const allChecked = checked.every(Boolean);
        checked.fill(!allChecked);
        renderList(projects, cursor.value, checked, scroll.value);
      } else if (key === "\r" || key === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve(checked);
        return;
      }
    }

    process.stdin.on("data", onKey);
  });
}

// ── Main ──

async function main() {
  console.log("Fetching projects...\n");
  const { projects } = await request("GET", "/v9/projects?limit=100");

  if (!projects || projects.length === 0) {
    console.log("Tidak ada project ditemukan.");
    return;
  }

  const checked = await selectProjects(projects);

  if (!checked) {
    console.log("Batal.");
    return;
  }

  const toDelete = projects.filter((_, i) => checked[i]);
  const toKeep = projects.filter((_, i) => !checked[i]);

  if (toDelete.length === 0) {
    console.log("Tidak ada project dipilih untuk dihapus.");
    return;
  }

  console.log("\n\x1b[31m\x1b[1m=== AKAN DIHAPUS ===\x1b[0m");
  toDelete.forEach((p) => console.log(`  \x1b[31m✗ ${p.name}\x1b[0m`));

  if (toKeep.length > 0) {
    console.log("\n\x1b[32m=== TETAP DISIMPAN ===\x1b[0m");
    toKeep.forEach((p) => console.log(`  \x1b[32m✓ ${p.name}\x1b[0m`));
  }

  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const confirm = await new Promise((resolve) => {
    rl.question(`\n\x1b[31mYakin hapus ${toDelete.length} project? (y/n): \x1b[0m`, resolve);
  });
  rl.close();

  if (confirm.trim().toLowerCase() !== "y") {
    console.log("Batal.");
    return;
  }

  console.log("\nMenghapus...");
  for (const p of toDelete) {
    try {
      await request("DELETE", `/v9/projects/${p.id}`);
      console.log(`  \x1b[32m✓ ${p.name}\x1b[0m`);
    } catch (e) {
      console.error(`  \x1b[31m✗ ${p.name}: ${e.message}\x1b[0m`);
    }
  }

  console.log("\n\x1b[32mSelesai!\x1b[0m");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
