import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 300 }, // sudden spike (e.g. NFP data released)
    { duration: "2m", target: 300 },  // hold traffic
    { duration: "30s", target: 0 },    // drop down
  ],
};

export default function () {
  const url = __ENV.TARGET_URL || "http://localhost:3000";

  // Simulate high-impact events traffic burst
  const newsRes = http.get(`${url}/api/events`);
  check(newsRes, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(0.1);
}
