export const BASE_URL = __ENV.BASE_URL || "http://localhost:30067";

export const profile = JSON.parse(
  open(`../profiles/${__ENV.PROFILE || "smoke"}.json`)
);

export const JSON_HEADERS = { "Content-Type": "application/json" };

export function loadOptions(extraThresholds = {}) {
  return {
    scenarios: {
      load: {
        executor: "ramping-arrival-rate",
        startRate: profile.startRate,
        timeUnit: "1s",
        stages: profile.stages,
        preAllocatedVUs: profile.preAllocatedVUs,
        maxVUs: profile.maxVUs,
      },
    },
    thresholds: {
      http_req_failed: ["rate<0.01"],
      http_req_duration: ["p(95)<500"],
      ...extraThresholds,
    },
  };
}