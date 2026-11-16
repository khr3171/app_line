import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  return {
    plugins: [
      react(),
      {
        name: "local-api",
        configureServer(server) {
          server.middlewares.use("/api", async (req, res) => {
            try {
              const { default: handler } = await import("./api/index.js");
              await handler(req, res);
            } catch {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "서버 설정을 확인해 주세요." }));
            }
          });
        },
      },
    ],
  };
});
