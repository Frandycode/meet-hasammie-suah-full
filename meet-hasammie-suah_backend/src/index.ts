/**
 * Meet HaSammie Suah — Backend API
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import 'dotenv/config';
import express                   from 'express';
import cors                      from 'cors';
import { ApolloServer }          from '@apollo/server';
import { expressMiddleware }     from '@apollo/server/express4';
import { makeExecutableSchema }  from '@graphql-tools/schema';
import path                      from 'path';
import { typeDefs }              from './graphql/schema/typeDefs';
import { resolvers }             from './graphql/resolvers/resolvers';
import { verifyToken, extractToken } from './utils/auth';
import { UPLOADS_DIR, BASE_URL, ensureUploadsDir } from './services/imageService';
import { prisma }                from './utils/prisma';
import { trackingLimiter, graphqlLimiter } from './middleware/rateLimit';
import { trackSchema, formatZodError }     from './utils/validation';
import { ZodError }              from 'zod';

const PORT = parseInt(process.env.PORT || '4000', 10);

async function bootstrap() {
  await ensureUploadsDir();

  const app = express();

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use(cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:4173',
    ],
    credentials: true,
  }));

  app.use(express.json({ limit: '50mb' }));

  // ── Serve uploaded images ─────────────────────────────────────────────────
  app.use('/uploads', express.static(UPLOADS_DIR));

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── Analytics tracking ────────────────────────────────────────────────────
  // Called by the frontend usePageView hook on every route change.
  // No auth required — public endpoint, but we keep it lightweight.
  app.post('/track', trackingLimiter, async (req, res) => {
    try {
      const data = trackSchema.parse(req.body);

      await prisma.pageView.create({
        data: {
          page:        data.page,
          referrer:    data.referrer   ?? null,
          userAgent:   data.userAgent  ?? null,
          sessionId:   data.sessionId,
          durationSec: data.durationSec ?? null,
        },
      });

      res.json({ ok: true });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: formatZodError(err) });
        return;
      }
      console.error('Track error:', err);
      res.status(500).json({ error: 'Failed to record page view' });
    }
  });

  // ── Apollo GraphQL ────────────────────────────────────────────────────────
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    introspection: process.env.NODE_ENV !== 'production',
    formatError: (err) => {
      console.error('GraphQL Error:', err.message);
      return { message: err.message, code: err.extensions?.code };
    },
  });

  await server.start();

  app.use(
    '/graphql',
    graphqlLimiter,
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token   = extractToken(req.headers.authorization);
        const payload = token ? verifyToken(token) : null;
        return { isAdmin: !!payload, admin: payload };
      },
    }) as unknown as express.RequestHandler,
  );

  app.listen(PORT, () => {
    console.log(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);
    console.log(`📁 Uploads from: ${UPLOADS_DIR}`);
    console.log(`🌍 Frontend:     ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  });
}

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
