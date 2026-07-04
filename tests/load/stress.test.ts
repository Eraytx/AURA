import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 100 },
    { duration: "2m", target: 200 },
    { duration: "3m", target: 500 }, // stress point
    { duration: "3m", target: 0 },
  ],
};

export default function () {
  const url = __ENV.TARGET_URL || "http://localhost:3000";

  // Simulate heavy query volume
  const newsRes = http.get(`${url}/api/events`);
  check(newsRes, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(0.5);
}
