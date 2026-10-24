import http from "k6/http";
import { check } from "k6";
import { BASE_URL, loadOptions } from "../lib/config.js";
import { prepare, noFollow } from "../lib/helpers.js";

export const options = loadOptions();

export function setup() {
  const data = prepare(20); // маленький набор, всё осядет в Redis
  for (const id of data.ids) http.get(`${BASE_URL}/r/${id}`, noFollow); // прогрев
  return data;
}

export default function (data) {
  const id = data.ids[Math.floor(Math.random() * data.ids.length)];
  const res = http.get(`${BASE_URL}/r/${id}`, noFollow);
  check(res, { "redirect": (r) => r.status === 301 || r.status === 302 });
}