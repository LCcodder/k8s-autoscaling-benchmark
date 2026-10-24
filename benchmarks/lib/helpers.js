import http from "k6/http";
import { check, fail } from "k6";
import { BASE_URL, JSON_HEADERS } from "./config.js";

export function prepare(urlCount) {
  const email = `bench-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const password = "AJSFa*Fya97GFAD";

  const reg = http.post(
    `${BASE_URL}/users`,
    JSON.stringify({ email, password, username: "bench" }),
    { headers: JSON_HEADERS }
  );
  if (!check(reg, { "register ok": (r) => r.status < 300 })) {
    fail(`register failed: ${reg.status} ${reg.body}`);
  }

  const login = http.post(`${BASE_URL}/auth`, JSON.stringify({ email, password }), {
    headers: JSON_HEADERS,
  });
  if (!check(login, { "login ok": (r) => r.status === 200 })) {
    fail(`login failed: ${login.status} ${login.body}`);
  }
  const token = login.json("token");

  // создаём ссылки пачками по 50, чтобы setup не шёл вечно
  const ids = [];
  for (let i = 0; i < urlCount; i += 50) {
    const batch = [];
    for (let j = i; j < Math.min(i + 50, urlCount); j++) {
      batch.push([
        "POST",
        `${BASE_URL}/urls`,
        JSON.stringify({ to: `https://example.com/${email}/${j}` }),
        { headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` } },
      ]);
    }
    for (const r of http.batch(batch)) {
      if (r.status < 300) ids.push(r.json("id"));
    }
  }
  if (ids.length === 0) fail("no urls created");
  return { token, ids };
}

export const noFollow = { redirects: 0 };