import http from "k6/http";
import { check } from "k6";
import { BASE_URL, JSON_HEADERS, loadOptions } from "../lib/config.js";
import { prepare, noFollow } from "../lib/helpers.js";

export const options = loadOptions();

export function setup() {
  const data = prepare(200);
  for (const id of data.ids) http.get(`${BASE_URL}/r/${id}`, noFollow);
  return data;
}

export default function (data) {
  if (Math.random() < 0.9) {
    const id = data.ids[Math.floor(Math.random() * data.ids.length)];
    const res = http.get(`${BASE_URL}/r/${id}`, noFollow);
    check(res, { "redirect": (r) => r.status === 301 || r.status === 302 });
  } else {
    const res = http.post(
      `${BASE_URL}/urls`,
      JSON.stringify({ to: `https://example.com/${Math.random()}` }),
      { headers: { ...JSON_HEADERS, Authorization: `Bearer ${data.token}` } }
    );
    check(res, { "created": (r) => r.status < 300 });
  }
}