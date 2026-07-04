import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5,
  duration: "1m",
};

export default function () {
  const url = __ENV.TARGET_URL || "http://localhost:3000";

  // 1. Check main page
  const homeRes = http.get(`${url}/`);
  check(homeRes, {
    "home returns status 200": (r) => r.status === 200,
  });

  // 2. Check news feed api
  const newsRes = http.get(`${url}/api/events`);
  check(newsRes, {
    "events returns status 200": (r) => r.status === 200,
    "events load under 500ms": (r) => r.timings.duration < 500,
  });

  // 3. Check health status api
  const healthRes = http.get(`${url}/api/health`);
  check(healthRes, {
    "health returns status 200": (r) => r.status === 200,
  });

  sleep(1);
}
