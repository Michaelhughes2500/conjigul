const path = require("path");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

// Trust the first proxy hop so express-rate-limit sees the real client IP
// when the app runs behind Nginx / a cloud load balancer.
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:"],
      },
    },
  }),
);

// Health endpoint is exempt from rate-limiting so load-balancer probes
// always get a timely 200, even when other routes are being throttled.
app.get("/health", (_req, res) => res.json({ status: "ok" }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.static(publicDir, { maxAge: "1h" }));

app.use((req, res) => {
  if (req.path.includes(".")) {
    res.status(404).end();
    return;
  }
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`conjigul running at http://localhost:${PORT}`);
});
