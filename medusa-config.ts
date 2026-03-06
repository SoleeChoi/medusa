import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    databaseDriverOptions: {
      ssl: false,
      sslmode: "disable",
    },
  },
  admin: {
    vite: (_) => {
      return {
        server: {
          host: "0.0.0.0",
          // Allow all hosts when running in Docker (development mode)
          // In production, this should be more restrictive
          allowedHosts: [
            "localhost",
            ".localhost",
            "127.0.0.1",
            ".ngrok-free.app",
          ],
          hmr: {
            // HMR websocket port inside container
            port: 5173,
            // Port browser connects to (exposed in docker-compose.yml)
            clientPort: 5173,
          },
        },
      }
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/translation",
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/toss",
            id: "toss",
            options: {
              apiKey: process.env.TOSS_API_KEY,
              retUrl: process.env.TOSS_RET_URL,
              retCancelUrl: process.env.TOSS_RET_CANCEL_URL,
              resultCallback: process.env.TOSS_RESULT_CALLBACK_URL,
              autoExecute: true,
              useMock: process.env.TOSS_USE_MOCK !== "false",
            }
          }
        ]
      }
    }
  ],
  featureFlags: {
    translation: true,
  },
})
