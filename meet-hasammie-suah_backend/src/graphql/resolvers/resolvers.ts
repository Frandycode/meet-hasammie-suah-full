/**
 * Meet HaSammie Suah — Backend API
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../../utils/prisma';
import { signToken } from '../../utils/auth';
import {
  storeImage,
  storeExternalUrl,
  resolvePublicUrl,
  deleteLocalFile,
} from '../../services/imageService';
import { sendContactEmail } from '../../services/emailService';
import {
  loginSchema,
  heroInputSchema,
  bioInputSchema,
  statInputSchema,
  achievementInputSchema,
  eventInputSchema,
  contactFormSchema,
  formatZodError,
} from '../../utils/validation';
import { ZodError } from 'zod';

interface Context {
  authHeader?: string;
  isAdmin: boolean;
}

// ── Auth guard ────────────────────────────────────────────────────────────────
function requireAdmin(ctx: Context) {
  if (!ctx.isAdmin) throw new Error('Unauthorized — admin access required');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function photoPublicUrl(p: { storageType: string; filePath: string | null; url: string | null }) {
  return resolvePublicUrl(p.storageType, p.filePath, p.url);
}

// ── Default site data (created on first run if DB is empty) ───────────────────
async function ensureDefaults() {
  const [hero, bio, social, contact, donate] = await Promise.all([
    prisma.siteHero.findFirst(),
    prisma.siteBio.findFirst(),
    prisma.siteSocial.findFirst(),
    prisma.siteContact.findFirst(),
    prisma.siteDonate.findFirst(),
  ]);

  await Promise.all([
    !hero    && prisma.siteHero.create({ data: {
      tagline:  'Born to Run. Built to Win.',
      subtitle: 'Top 5 Track Runner in the State of Oklahoma',
      quote:    '"Every step is a statement. Every finish line, a promise."',
    }}),
    !bio     && prisma.siteBio.create({ data: {
      intro:     "Sammie Suah isn't just a runner — she's a force of nature.",
      story:     'Growing up in Tulsa, Oklahoma, Sammie discovered her love for running at age 10.',
      coachNote: 'Sammie is one of those rare athletes who combines natural ability with an unmatched work ethic.',
      coachName: 'Coach [Name] · Union High School Track & Field',
    }}),
    !social  && prisma.siteSocial.create({ data: {} }),
    !contact && prisma.siteContact.create({ data: { email: 'sammie@example.com', forMedia: 'media@example.com' } }),
    !donate  && prisma.siteDonate.create({ data: { message: "Help fuel Sammie's journey to the top." } }),
  ]);
}

export const resolvers = {

  // ── Field resolvers ─────────────────────────────────────────────────────────
  GalleryPhoto: {
    publicUrl: (parent: any) => photoPublicUrl(parent),
    createdAt: (parent: any) => parent.createdAt.toISOString(),
  },
  SiteImage: {
    publicUrl: (parent: any) => photoPublicUrl(parent),
  },
  Event: {
    date: (parent: any) => parent.date.toISOString(),
  },
  BlogPost: {
    createdAt:   (p: any) => p.createdAt.toISOString(),
    updatedAt:   (p: any) => p.updatedAt.toISOString(),
    publishedAt: (p: any) => p.publishedAt?.toISOString() ?? null,
    tags:        (p: any) => p.tags ?? [],
  },
  SocialPost: {
    createdAt: (p: any) => p.createdAt.toISOString(),
    postedAt:  (p: any) => p.postedAt.toISOString(),
  },
  SupporterMessage: {
    createdAt: (p: any) => p.createdAt.toISOString(),
  },

  // ── Queries ─────────────────────────────────────────────────────────────────
  Query: {
    siteData: async () => {
      await ensureDefaults();
      const [
        hero, bio, social, contact, donate,
        stats, achievements, gallery, events,
        profileImage, heroImage,
        blogPosts, socialPosts, supporterMessages,
      ] = await Promise.all([
        prisma.siteHero.findFirst(),
        prisma.siteBio.findFirst(),
        prisma.siteSocial.findFirst(),
        prisma.siteContact.findFirst(),
        prisma.siteDonate.findFirst(),
        prisma.stat.findMany({ orderBy: { order: 'asc' } }),
        prisma.achievement.findMany({ orderBy: { order: 'asc' } }),
        prisma.galleryPhoto.findMany({ orderBy: { order: 'asc' } }),
        prisma.event.findMany({ orderBy: { date: 'asc' } }),
        prisma.siteImage.findUnique({ where: { type: 'PROFILE' } }),
        prisma.siteImage.findUnique({ where: { type: 'HERO_BG' } }),
        prisma.blogPost.findMany({
          where:   { published: true },
          orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
        }),
        prisma.socialPost.findMany({
          where:   { published: true },
          orderBy: [{ featured: 'desc' }, { order: 'asc' }, { postedAt: 'desc' }],
          take:    12,
        }),
        prisma.supporterMessage.findMany({
          where:   { approved: true },
          orderBy: [{ pinned: 'desc' }, { featured: 'desc' }, { createdAt: 'desc' }],
          take:    50,
        }),
      ]);

      return {
        hero, bio, social, contact, donate,
        stats, achievements, gallery, events,
        profileImage, heroImage,
        blogPosts, socialPosts, supporterMessages,
      };
    },

    achievements: () => prisma.achievement.findMany({ orderBy: { order: 'asc' } }),
    stats:        () => prisma.stat.findMany({ orderBy: { order: 'asc' } }),
    events:       () => prisma.event.findMany({ orderBy: { date: 'asc' } }),
    gallery: (_: any, { category }: { category?: string }) =>
      prisma.galleryPhoto.findMany({
        where:   category ? { category: category as any } : undefined,
        orderBy: { order: 'asc' },
      }),

    analyticsStats: async (_: any, __: any, ctx: Context) => {
      requireAdmin(ctx);
      const now   = new Date();
      const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const [allViews, recentViews] = await Promise.all([
        prisma.pageView.findMany({ select: { page: true, sessionId: true, durationSec: true } }),
        prisma.pageView.findMany({ where: { createdAt: { gte: ago7d } }, select: { createdAt: true } }),
      ]);
      const totalViews     = allViews.length;
      const uniqueSessions = new Set(allViews.map(v => v.sessionId)).size;
      const withDuration   = allViews.filter(v => v.durationSec !== null);
      const avgDurationSec = withDuration.length
        ? withDuration.reduce((sum, v) => sum + (v.durationSec ?? 0), 0) / withDuration.length
        : null;
      const pageCounts: Record<string, number> = {};
      for (const v of allViews) pageCounts[v.page] = (pageCounts[v.page] ?? 0) + 1;
      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([page, views]) => ({ page, views }));
      const dayCounts: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        dayCounts[d.toISOString().slice(0, 10)] = 0;
      }
      for (const v of recentViews) {
        const day = v.createdAt.toISOString().slice(0, 10);
        if (day in dayCounts) dayCounts[day]++;
      }
      const viewsLast7Days = Object.entries(dayCounts).map(([date, views]) => ({ date, views }));
      return { totalViews, uniqueSessions, avgDurationSec, topPages, viewsLast7Days };
    },

    pressKit: async () => {
      let meta = await prisma.pressKitMeta.findFirst();
      if (!meta) {
        meta = await prisma.pressKitMeta.create({
          data: {
            pressBio:     'HaSammie Suah is a top-5 ranked track and field athlete in the state of Oklahoma, competing for Union High School in Tulsa. Known for explosive speed and an unmatched competitive spirit, she has established herself as one of the most promising sprinters in the region.',
            contactName:  'HaSammie Suah',
            contactEmail: '',
          },
        });
      }
      const assets = await prisma.pressKitAsset.findMany({ orderBy: { order: 'asc' } });
      const resolvedAssets = assets.map(a => ({
        ...a,
        url: resolvePublicUrl(a.storageType, a.filePath, a.url),
      }));
      return { meta, assets: resolvedAssets };
    },

    sponsors: () => prisma.sponsor.findMany({
      where:   { active: true },
      orderBy: [{ tier: 'asc' }, { order: 'asc' }],
    }),

    videos: () => prisma.videoHighlight.findMany({
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    }),

    blogPosts: (_: any, { category, publishedOnly = true }: { category?: string; publishedOnly?: boolean }) =>
      prisma.blogPost.findMany({
        where: {
          ...(publishedOnly ? { published: true } : {}),
          ...(category ? { category: category as any } : {}),
        },
        orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { order: 'asc' }],
      }),

    blogPost: (_: any, { slug }: { slug: string }) =>
      prisma.blogPost.findUnique({ where: { slug } }),

    socialPosts: (_: any, { publishedOnly = true }: any) =>
      prisma.socialPost.findMany({
        where:   publishedOnly ? { published: true } : {},
        orderBy: [{ featured: 'desc' }, { order: 'asc' }, { postedAt: 'desc' }],
      }),

    supporterMessages: (_: any, { approvedOnly = true }: any) =>
      prisma.supporterMessage.findMany({
        where:   approvedOnly ? { approved: true } : {},
        orderBy: [{ pinned: 'desc' }, { featured: 'desc' }, { createdAt: 'desc' }],
      }),
  },

  // ── Mutations ────────────────────────────────────────────────────────────────
  Mutation: {

    // ── Auth ──────────────────────────────────────────────────────────────────
    login: async (_: any, { password }: { password: string }) => {
      try { loginSchema.parse({ password }); }
      catch (err) { if (err instanceof ZodError) throw new Error(formatZodError(err)); throw err; }
      const admin = await prisma.admin.findFirst();
      if (!admin) throw new Error('No admin account found — run the seed script first');
      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid) throw new Error('Incorrect password');
      const token = signToken({ adminId: admin.id, username: admin.username });
      return { token, message: 'Login successful' };
    },

    // ── Site content ──────────────────────────────────────────────────────────
    updateHero: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const existing = await prisma.siteHero.findFirst();
      if (existing) return prisma.siteHero.update({ where: { id: existing.id }, data: input });
      return prisma.siteHero.create({ data: input });
    },

    updateBio: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const existing = await prisma.siteBio.findFirst();
      if (existing) return prisma.siteBio.update({ where: { id: existing.id }, data: input });
      return prisma.siteBio.create({ data: input });
    },

    updateSocial: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const existing = await prisma.siteSocial.findFirst();
      if (existing) return prisma.siteSocial.update({ where: { id: existing.id }, data: input });
      return prisma.siteSocial.create({ data: input });
    },

    updateContact: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const existing = await prisma.siteContact.findFirst();
      if (existing) return prisma.siteContact.update({ where: { id: existing.id }, data: input });
      return prisma.siteContact.create({ data: input });
    },

    updateDonate: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const existing = await prisma.siteDonate.findFirst();
      if (existing) return prisma.siteDonate.update({ where: { id: existing.id }, data: input });
      return prisma.siteDonate.create({ data: input });
    },

    // ── Stats ─────────────────────────────────────────────────────────────────
    upsertStats: async (_: any, { stats }: any, ctx: Context) => {
      requireAdmin(ctx);
      try {
        const validated = stats.map((s: any) => statInputSchema.parse(s));
        await prisma.stat.deleteMany();
        return prisma.$transaction(
          validated.map((s: any, i: number) =>
            prisma.stat.create({ data: { ...s, order: s.order ?? i } })
          )
        );
      } catch (err) {
        if (err instanceof ZodError) throw new Error(formatZodError(err));
        throw err;
      }
    },

    // ── Achievements ──────────────────────────────────────────────────────────
    createAchievement: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      try { achievementInputSchema.parse(input); }
      catch (err) { if (err instanceof ZodError) throw new Error(formatZodError(err)); throw err; }
      const count = await prisma.achievement.count();
      return prisma.achievement.create({ data: { ...input, order: input.order ?? count } });
    },

    updateAchievement: async (_: any, { id, input }: any, ctx: Context) => {
      requireAdmin(ctx);
      try { achievementInputSchema.partial().parse(input); }
      catch (err) { if (err instanceof ZodError) throw new Error(formatZodError(err)); throw err; }
      return prisma.achievement.update({ where: { id }, data: input });
    },

    deleteAchievement: async (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      await prisma.achievement.delete({ where: { id } });
      return true;
    },

    // ── Gallery — file upload ─────────────────────────────────────────────────
    uploadGalleryPhoto: async (_: any, { file, input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const { createReadStream, filename, mimetype } = await file;
      const stored = await storeImage(createReadStream(), filename, mimetype);
      const count  = await prisma.galleryPhoto.count();
      return prisma.galleryPhoto.create({
        data: {
          caption:     input.caption,
          category:    input.category,
          date:        input.date,
          storageType: stored.storageType,
          filePath:    stored.filePath,
          url:         stored.url,
          width:       stored.width,
          height:      stored.height,
          fileSize:    stored.fileSize,
          mimeType:    stored.mimeType,
          order:       count,
        },
      });
    },

    // ── Gallery — external URL ────────────────────────────────────────────────
    addGalleryPhotoUrl: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      if (!input.url) throw new Error('URL is required');
      const stored = storeExternalUrl(input.url);
      const count  = await prisma.galleryPhoto.count();
      return prisma.galleryPhoto.create({
        data: {
          caption:     input.caption,
          category:    input.category,
          date:        input.date,
          storageType: 'URL',
          url:         stored.url,
          order:       count,
        },
      });
    },

    deleteGalleryPhoto: async (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      const photo = await prisma.galleryPhoto.findUnique({ where: { id } });
      if (!photo) throw new Error('Photo not found');
      if (photo.storageType === 'LOCAL' && photo.filePath) await deleteLocalFile(photo.filePath);
      await prisma.galleryPhoto.delete({ where: { id } });
      return true;
    },

    // ── Events ────────────────────────────────────────────────────────────────
    createEvent: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      try { eventInputSchema.parse(input); }
      catch (err) { if (err instanceof ZodError) throw new Error(formatZodError(err)); throw err; }
      const count = await prisma.event.count();
      return prisma.event.create({
        data: { ...input, date: new Date(input.date), order: input.order ?? count },
      });
    },

    updateEvent: async (_: any, { id, input }: any, ctx: Context) => {
      requireAdmin(ctx);
      try { eventInputSchema.partial().parse(input); }
      catch (err) { if (err instanceof ZodError) throw new Error(formatZodError(err)); throw err; }
      return prisma.event.update({
        where: { id },
        data:  { ...input, date: new Date(input.date) },
      });
    },

    deleteEvent: async (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      await prisma.event.delete({ where: { id } });
      return true;
    },

    // ── Site images — file upload ─────────────────────────────────────────────
    uploadSiteImage: async (_: any, { file, type }: any, ctx: Context) => {
      requireAdmin(ctx);
      const { createReadStream, filename, mimetype } = await file;
      const old = await prisma.siteImage.findUnique({ where: { type } });
      if (old?.storageType === 'LOCAL' && old.filePath) await deleteLocalFile(old.filePath);
      const stored = await storeImage(createReadStream(), filename, mimetype);
      return prisma.siteImage.upsert({
        where:  { type },
        update: { storageType: stored.storageType, filePath: stored.filePath, url: stored.url },
        create: { type, storageType: stored.storageType, filePath: stored.filePath, url: stored.url },
      });
    },

    setSiteImageUrl: async (_: any, { url, type }: any, ctx: Context) => {
      requireAdmin(ctx);
      const old = await prisma.siteImage.findUnique({ where: { type } });
      if (old?.storageType === 'LOCAL' && old.filePath) await deleteLocalFile(old.filePath);
      return prisma.siteImage.upsert({
        where:  { type },
        update: { storageType: 'URL', filePath: null, url },
        create: { type, storageType: 'URL', filePath: null, url },
      });
    },

    removeSiteImage: async (_: any, { type }: any, ctx: Context) => {
      requireAdmin(ctx);
      const img = await prisma.siteImage.findUnique({ where: { type } });
      if (!img) return true;
      if (img.storageType === 'LOCAL' && img.filePath) await deleteLocalFile(img.filePath);
      await prisma.siteImage.delete({ where: { type } });
      return true;
    },

    // ── Contact form — public ─────────────────────────────────────────────────
    sendContactEmail: async (_: any, { input }: any) => {
      try {
        const data = contactFormSchema.parse(input);
        await sendContactEmail(data);
        return true;
      } catch (err) {
        if (err instanceof ZodError) throw new Error(formatZodError(err));
        console.error('sendContactEmail error:', err);
        throw new Error('Failed to send message. Please try again.');
      }
    },

    // ── Press kit ─────────────────────────────────────────────────────────────
    updatePressKitMeta: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const existing = await prisma.pressKitMeta.findFirst();
      if (existing) return prisma.pressKitMeta.update({ where: { id: existing.id }, data: input });
      return prisma.pressKitMeta.create({ data: input });
    },

    addPressKitAssetUrl: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const count = await prisma.pressKitAsset.count();
      return prisma.pressKitAsset.create({
        data: { label: input.label, type: input.type, storageType: 'URL', url: input.url, order: count },
      });
    },

    deletePressKitAsset: async (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      const asset = await prisma.pressKitAsset.findUnique({ where: { id } });
      if (!asset) throw new Error('Asset not found');
      if (asset.storageType === 'LOCAL' && asset.filePath) await deleteLocalFile(asset.filePath);
      await prisma.pressKitAsset.delete({ where: { id } });
      return true;
    },

    reorderPressKitAssets: async (_: any, { ids }: { ids: string[] }, ctx: Context) => {
      requireAdmin(ctx);
      await prisma.$transaction(
        ids.map((id, order) => prisma.pressKitAsset.update({ where: { id }, data: { order } }))
      );
      return prisma.pressKitAsset.findMany({ orderBy: { order: 'asc' } });
    },

    // ── Sponsors ──────────────────────────────────────────────────────────────
    createSponsor: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const count = await prisma.sponsor.count();
      return prisma.sponsor.create({ data: { ...input, order: input.order ?? count } });
    },

    updateSponsor: async (_: any, { id, input }: any, ctx: Context) => {
      requireAdmin(ctx);
      return prisma.sponsor.update({ where: { id }, data: input });
    },

    deleteSponsor: async (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      await prisma.sponsor.delete({ where: { id } });
      return true;
    },

    reorderSponsors: async (_: any, { ids }: { ids: string[] }, ctx: Context) => {
      requireAdmin(ctx);
      await prisma.$transaction(
        ids.map((id, order) => prisma.sponsor.update({ where: { id }, data: { order } }))
      );
      return prisma.sponsor.findMany({ orderBy: [{ tier: 'asc' }, { order: 'asc' }] });
    },

    // ── Videos ────────────────────────────────────────────────────────────────
    createVideo: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const count = await prisma.videoHighlight.count();
      return prisma.videoHighlight.create({ data: { ...input, order: input.order ?? count } });
    },

    updateVideo: async (_: any, { id, input }: any, ctx: Context) => {
      requireAdmin(ctx);
      return prisma.videoHighlight.update({ where: { id }, data: input });
    },

    deleteVideo: async (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      await prisma.videoHighlight.delete({ where: { id } });
      return true;
    },

    reorderVideos: async (_: any, { ids }: { ids: string[] }, ctx: Context) => {
      requireAdmin(ctx);
      await prisma.$transaction(
        ids.map((id, order) => prisma.videoHighlight.update({ where: { id }, data: { order } }))
      );
      return prisma.videoHighlight.findMany({ orderBy: [{ featured: 'desc' }, { order: 'asc' }] });
    },

    // ── Blog / News ───────────────────────────────────────────────────────────
    createBlogPost: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      return prisma.blogPost.create({
        data: {
          ...input,
          tags:        input.tags ?? [],
          publishedAt: input.published ? new Date() : null,
        },
      });
    },

    updateBlogPost: async (_: any, { id, input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const existing = await prisma.blogPost.findUniqueOrThrow({ where: { id } });
      return prisma.blogPost.update({
        where: { id },
        data: {
          ...input,
          tags:        input.tags ?? existing.tags,
          publishedAt: input.published && !existing.publishedAt ? new Date() : existing.publishedAt,
        },
      });
    },

    deleteBlogPost: async (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      await prisma.blogPost.delete({ where: { id } });
      return true;
    },

    publishBlogPost: async (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      return prisma.blogPost.update({
        where: { id },
        data:  { published: true, publishedAt: new Date() },
      });
    },

    unpublishBlogPost: async (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      return prisma.blogPost.update({ where: { id }, data: { published: false } });
    },

    reorderBlogPosts: async (_: any, { ids }: { ids: string[] }, ctx: Context) => {
      requireAdmin(ctx);
      await Promise.all(ids.map((id, order) => prisma.blogPost.update({ where: { id }, data: { order } })));
      return prisma.blogPost.findMany({ orderBy: { order: 'asc' } });
    },

    // ── Social feed ───────────────────────────────────────────────────────────
    createSocialPost: async (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      return prisma.socialPost.create({
        data: { ...input, postedAt: input.postedAt ? new Date(input.postedAt) : new Date() },
      });
    },

    updateSocialPost: async (_: any, { id, input }: any, ctx: Context) => {
      requireAdmin(ctx);
      return prisma.socialPost.update({
        where: { id },
        data:  { ...input, postedAt: input.postedAt ? new Date(input.postedAt) : undefined },
      });
    },

    deleteSocialPost: async (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      await prisma.socialPost.delete({ where: { id } });
      return true;
    },

    reorderSocialPosts: async (_: any, { ids }: { ids: string[] }, ctx: Context) => {
      requireAdmin(ctx);
      await Promise.all(
        ids.map((id, order) => prisma.socialPost.update({ where: { id }, data: { order } }))
      );
      return prisma.socialPost.findMany({ orderBy: { order: 'asc' } });
    },

    // ── Supporter wall ────────────────────────────────────────────────────────
    submitSupporterMessage: async (_: any, { input }: any) => {
      // Public — no auth required. approved defaults to false (needs admin review).
      return prisma.supporterMessage.create({ data: input });
    },

    approveSupporterMessage: async (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      return prisma.supporterMessage.update({ where: { id }, data: { approved: true } });
    },

    featureSupporterMessage: async (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      const msg = await prisma.supporterMessage.findUniqueOrThrow({ where: { id } });
      return prisma.supporterMessage.update({ where: { id }, data: { featured: !msg.featured } });
    },

    pinSupporterMessage: async (_: any, { id, pinned }: any, ctx: Context) => {
      requireAdmin(ctx);
      return prisma.supporterMessage.update({ where: { id }, data: { pinned } });
    },

    deleteSupporterMessage: async (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      await prisma.supporterMessage.delete({ where: { id } });
      return true;
    },
  },
};
