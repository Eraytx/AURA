import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 100 }, // Ramp-up
    { duration: "5m", target: 100 }, // Steady
    { duration: "1m", target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ["p(95)<800"], // p95 response time < 800ms
    http_req_failed: ["rate<0.01"],   // error rate < 1%
  },
};

export default function () {
  const url = __ENV.TARGET_URL || "http://localhost:3000";

  // Simulate user browsing economic news
  const newsRes = http.get(`${url}/api/events`);
  check(newsRes, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(Math.random() * 2 + 1); // Think time 1-3s
}
