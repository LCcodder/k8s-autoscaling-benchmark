import http from "k6/http";
import { check } from "k6";
import { BASE_URL, loadOptions } from "../lib/config.js";
import { prepare, noFollow } from "../lib/helpers.js";

export const options = loadOptions();

export function setup() {
  return prepare(Number(__ENV.URL_COUNT || 2000));
}

export default function (data) {
  const id = data.ids[Math.floor(Math.random() * data.ids.length)];
  const res = http.get(`${BASE_URL}/r/${id}`, noFollow);
  check(res, { "redirect": (r) => r.status === 301 || r.status === 302 });
}