-- CreateEnum
CREATE TYPE "MedalType" AS ENUM ('GOLD', 'SILVER', 'BRONZE');

-- CreateEnum
CREATE TYPE "PhotoCategory" AS ENUM ('RACE', 'TRAINING', 'TEAM', 'AWARDS', 'PERSONAL');

-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('LOCAL', 'CLOUDINARY', 'URL');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('MEET', 'CHAMPIONSHIP', 'TRAINING', 'OTHER');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('PROFILE', 'HERO_BG');

-- CreateEnum
CREATE TYPE "PressAssetType" AS ENUM ('PHOTO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "SponsorTier" AS ENUM ('GOLD', 'SILVER', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "VideoCategory" AS ENUM ('RACE', 'TRAINING', 'INTERVIEW', 'OTHER');

-- CreateEnum
CREATE TYPE "BlogCategory" AS ENUM ('NEWS', 'TRAINING', 'PERSONAL', 'MEDIA');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('INSTAGRAM', 'TIKTOK', 'TWITTER', 'OTHER');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteHero" (
    "id" TEXT NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT 'Born to Run. Built to Win.',
    "subtitle" TEXT NOT NULL DEFAULT 'Top 5 Track Runner in the State of Oklahoma',
    "quote" TEXT NOT NULL DEFAULT '"Every step is a statement. Every finish line, a promise."',

    CONSTRAINT "SiteHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteBio" (
    "id" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "coachNote" TEXT NOT NULL,
    "coachName" TEXT NOT NULL,

    CONSTRAINT "SiteBio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSocial" (
    "id" TEXT NOT NULL,
    "instagram" TEXT,
    "twitter" TEXT,
    "tiktok" TEXT,

    CONSTRAINT "SiteSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContact" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "forMedia" TEXT NOT NULL,

    CONSTRAINT "SiteContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteDonate" (
    "id" TEXT NOT NULL,
    "cashapp" TEXT,
    "venmo" TEXT,
    "zelle" TEXT,
    "gofundme" TEXT,
    "message" TEXT NOT NULL,

    CONSTRAINT "SiteDonate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stat" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "medal" "MedalType" NOT NULL DEFAULT 'BRONZE',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "category" "PhotoCategory" NOT NULL DEFAULT 'PERSONAL',
    "date" TEXT NOT NULL,
    "storageType" "StorageType" NOT NULL DEFAULT 'LOCAL',
    "filePath" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "url" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "type" "EventType" NOT NULL DEFAULT 'MEET',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteImage" (
    "id" TEXT NOT NULL,
    "type" "ImageType" NOT NULL,
    "storageType" "StorageType" NOT NULL DEFAULT 'LOCAL',
    "filePath" TEXT,
    "url" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT NOT NULL,
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PressKitAsset" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "PressAssetType" NOT NULL DEFAULT 'PHOTO',
    "storageType" "StorageType" NOT NULL DEFAULT 'LOCAL',
    "filePath" TEXT,
    "url" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PressKitAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PressKitMeta" (
    "id" TEXT NOT NULL,
    "pressBio" TEXT NOT NULL,
    "contactName" TEXT NOT NULL DEFAULT 'HaSammie Suah',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PressKitMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "SponsorTier" NOT NULL DEFAULT 'COMMUNITY',
    "logoUrl" TEXT,
    "website" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoHighlight" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "embedUrl" TEXT NOT NULL,
    "thumbnail" TEXT,
    "category" "VideoCategory" NOT NULL DEFAULT 'RACE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverUrl" TEXT,
    "category" "BlogCategory" NOT NULL DEFAULT 'NEWS',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL DEFAULT 'INSTAGRAM',
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "postUrl" TEXT NOT NULL,
    "likes" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupporterMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "amount" TEXT,
    "message" TEXT NOT NULL,
    "platform" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "emoji" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupporterMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SiteImage_type_key" ON "SiteImage"("type");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_page_idx" ON "PageView"("page");

-- CreateIndex
CREATE INDEX "PageView_sessionId_idx" ON "PageView"("sessionId");

-- CreateIndex
CREATE INDEX "PressKitAsset_type_idx" ON "PressKitAsset"("type");

-- CreateIndex
CREATE INDEX "Sponsor_tier_idx" ON "Sponsor"("tier");

-- CreateIndex
CREATE INDEX "Sponsor_active_idx" ON "Sponsor"("active");

-- CreateIndex
CREATE INDEX "VideoHighlight_category_idx" ON "VideoHighlight"("category");

-- CreateIndex
CREATE INDEX "VideoHighlight_featured_idx" ON "VideoHighlight"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_published_idx" ON "BlogPost"("published");

-- CreateIndex
CREATE INDEX "BlogPost_category_idx" ON "BlogPost"("category");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_featured_idx" ON "BlogPost"("featured");

-- CreateIndex
CREATE INDEX "SocialPost_published_idx" ON "SocialPost"("published");

-- CreateIndex
CREATE INDEX "SocialPost_platform_idx" ON "SocialPost"("platform");

-- CreateIndex
CREATE INDEX "SocialPost_featured_idx" ON "SocialPost"("featured");

-- CreateIndex
CREATE INDEX "SupporterMessage_approved_idx" ON "SupporterMessage"("approved");

-- CreateIndex
CREATE INDEX "SupporterMessage_featured_idx" ON "SupporterMessage"("featured");

-- CreateIndex
CREATE INDEX "SupporterMessage_pinned_idx" ON "SupporterMessage"("pinned");
