// Connect Koora's Beds24 account.
//   node scripts/beds24-connect.mjs invite <INVITE_CODE>   -> exchanges the one-time invite code,
//        saves the long-lived refresh token to ~/.koora-keys/beds24-refresh-token (chmod 600)
//   node scripts/beds24-connect.mjs rooms                  -> lists properties + rooms so villa-map.json can be filled
// The refresh token is never printed.
import { mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const API = "https://api.beds24.com/v2";
const dir = join(homedir(), ".koora-keys");
const file = join(dir, "beds24-refresh-token");
const [cmd, arg] = process.argv.slice(2);

async function getJson(path, headers) {
  const res = await fetch(API + path, { headers: { accept: "application/json", ...headers } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status} ${JSON.stringify(body).slice(0, 200)}`);
  return body;
}

if (cmd === "invite") {
  // A Beds24 code can be used ONCE. Save whatever comes back before doing anything else.
  if (!arg) throw new Error("usage: invite <INVITE_CODE>");
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  let res = await fetch(API + "/authentication/setup", { headers: { accept: "application/json", code: arg } });
  let body = await res.json().catch(() => ({}));
  if (!body.refreshToken) {
    res = await fetch(API + "/authentication/token", { headers: { accept: "application/json", refreshToken: arg } });
    body = await res.json().catch(() => ({}));
  }
  writeFileSync(join(dir, "beds24-last-response.json"), JSON.stringify(body), { mode: 0o600 });
  const refresh = body.refreshToken || (body.token ? arg : null);
  if (!refresh) throw new Error("Beds24 refused the code: " + (body.error || res.status));
  writeFileSync(file, refresh, { mode: 0o600 });
  chmodSync(file, 0o600);
  console.log("Connected. Refresh token saved to", file);
} else if (cmd === "rooms") {
  const refreshToken = readFileSync(file, "utf8").trim();
  const { token } = await getJson("/authentication/token", { refreshToken });
  const props = await getJson("/properties?includeAllRooms=true", { token });
  for (const p of props.data || []) {
    console.log(`property ${p.id}  ${p.name}  (${p.currency || "?"})`);
    for (const r of p.roomTypes || []) console.log(`   room ${r.id}  ${r.name}  max ${r.maxPeople ?? "?"}`);
  }
} else {
  console.log("usage: node scripts/beds24-connect.mjs invite <CODE> | rooms");
  process.exitCode = 1;
}
