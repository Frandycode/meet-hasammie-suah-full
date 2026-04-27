/**
 * Meet HaSammie Suah — Backend API
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
export const typeDefs = `#graphql

  # ── Scalars ────────────────────────────────────────────────────────────────
  scalar Upload
  scalar DateTime

  # ── Enums ──────────────────────────────────────────────────────────────────
  enum MedalType     { GOLD SILVER BRONZE }
  enum PhotoCategory { RACE TRAINING TEAM AWARDS PERSONAL }
  enum StorageType   { LOCAL CLOUDINARY URL }
  enum EventType     { MEET CHAMPIONSHIP TRAINING OTHER }
  enum ImageType     { PROFILE HERO_BG }
  enum VideoCategory { RACE TRAINING INTERVIEW OTHER }
  enum SponsorTier   { GOLD SILVER COMMUNITY }
  enum PressAssetType { PHOTO DOCUMENT }
  enum BlogCategory  { NEWS TRAINING PERSONAL MEDIA }
  enum SocialPlatform { INSTAGRAM TIKTOK TWITTER OTHER }

  # ── Site sections ──────────────────────────────────────────────────────────
  type Hero {
    id:       String!
    tagline:  String!
    subtitle: String!
    quote:    String!
  }

  type Bio {
    id:        String!
    intro:     String!
    story:     String!
    coachNote: String!
    coachName: String!
  }

  type Social {
    id:        String!
    instagram: String
    twitter:   String
    tiktok:    String
  }

  type Contact {
    id:       String!
    email:    String!
    forMedia: String!
  }

  type Donate {
    id:       String!
    cashapp:  String
    venmo:    String
    zelle:    String
    gofundme: String
    message:  String!
  }

  type Stat {
    id:    String!
    label: String!
    value: String!
    unit:  String
    order: Int!
  }

  type Achievement {
    id:          String!
    title:       String!
    description: String!
    date:        String!
    medal:       MedalType!
    order:       Int!
  }

  type GalleryPhoto {
    id:          String!
    caption:     String!
    category:    PhotoCategory!
    date:        String!
    storageType: StorageType!
    publicUrl:   String
    width:       Int
    height:      Int
    order:       Int!
    createdAt:   DateTime!
  }

  type Event {
    id:       String!
    title:    String!
    date:     DateTime!
    location: String!
    type:     EventType!
    order:    Int!
  }

  type SiteImage {
    id:          String!
    type:        ImageType!
    storageType: StorageType!
    publicUrl:   String
  }

  # ── Video highlights ───────────────────────────────────────────────────────
  type VideoHighlight {
    id:        String!
    title:     String!
    url:       String!
    embedUrl:  String!
    thumbnail: String
    category:  VideoCategory!
    featured:  Boolean!
    order:     Int!
  }

  # ── Sponsors ───────────────────────────────────────────────────────────────
  type Sponsor {
    id:          String!
    name:        String!
    tier:        SponsorTier!
    logoUrl:     String
    website:     String
    description: String
    order:       Int!
    active:      Boolean!
  }

  # ── Press kit ──────────────────────────────────────────────────────────────
  type PressKitAsset {
    id:          String!
    label:       String!
    type:        PressAssetType!
    storageType: StorageType!
    url:         String
    fileSize:    Int
    mimeType:    String
    order:       Int!
  }

  type PressKitMeta {
    id:           String!
    pressBio:     String!
    contactName:  String!
    contactEmail: String!
  }

  type PressKit {
    meta:   PressKitMeta!
    assets: [PressKitAsset!]!
  }

  # ── Analytics ──────────────────────────────────────────────────────────────
  type PageViewStat {
    page:  String!
    views: Int!
  }

  type AnalyticsStats {
    totalViews:     Int!
    uniqueSessions: Int!
    avgDurationSec: Float
    topPages:       [PageViewStat!]!
    viewsLast7Days: [DailyViews!]!
  }

  type DailyViews {
    date:  String!
    views: Int!
  }

  # ── Blog / News ────────────────────────────────────────────────────────────
  type BlogPost {
    id:          String!
    title:       String!
    slug:        String!
    excerpt:     String!
    content:     String!
    coverUrl:    String
    category:    BlogCategory!
    tags:        [String!]!
    published:   Boolean!
    publishedAt: DateTime
    featured:    Boolean!
    order:       Int!
    createdAt:   DateTime!
    updatedAt:   DateTime!
  }

  # ── Social feed ────────────────────────────────────────────────────────────
  type SocialPost {
    id:        String!
    platform:  SocialPlatform!
    imageUrl:  String!
    caption:   String!
    postUrl:   String!
    likes:     Int
    published: Boolean!
    featured:  Boolean!
    order:     Int!
    postedAt:  DateTime!
    createdAt: DateTime!
  }

  # ── Supporter wall ─────────────────────────────────────────────────────────
  type SupporterMessage {
    id:        String!
    name:      String!
    location:  String
    amount:    String
    message:   String!
    platform:  String
    approved:  Boolean!
    featured:  Boolean!
    pinned:    Boolean!
    emoji:     String
    createdAt: DateTime!
  }

  # ── Full site data (single query powers the whole frontend) ────────────────
  type SiteData {
    hero:              Hero
    bio:               Bio
    social:            Social
    contact:           Contact
    donate:            Donate
    stats:             [Stat!]!
    achievements:      [Achievement!]!
    gallery:           [GalleryPhoto!]!
    events:            [Event!]!
    profileImage:      SiteImage
    heroImage:         SiteImage
    blogPosts:         [BlogPost!]!
    socialPosts:       [SocialPost!]!
    supporterMessages: [SupporterMessage!]!
  }

  # ── Auth ───────────────────────────────────────────────────────────────────
  type AuthPayload {
    token:   String!
    message: String!
  }

  # ── Queries ────────────────────────────────────────────────────────────────
  type Query {
    siteData:                                          SiteData!
    achievements:                                      [Achievement!]!
    gallery(category: PhotoCategory):                  [GalleryPhoto!]!
    events:                                            [Event!]!
    stats:                                             [Stat!]!
    analyticsStats:                                    AnalyticsStats!
    pressKit:                                          PressKit!
    sponsors:                                          [Sponsor!]!
    videos:                                            [VideoHighlight!]!
    blogPosts(category: BlogCategory, publishedOnly: Boolean): [BlogPost!]!
    blogPost(slug: String!):                           BlogPost
    socialPosts(publishedOnly: Boolean):               [SocialPost!]!
    supporterMessages(approvedOnly: Boolean):          [SupporterMessage!]!
  }

  # ── Input types ────────────────────────────────────────────────────────────
  input HeroInput {
    tagline:  String
    subtitle: String
    quote:    String
  }

  input BioInput {
    intro:     String
    story:     String
    coachNote: String
    coachName: String
  }

  input SocialInput {
    instagram: String
    twitter:   String
    tiktok:    String
  }

  input ContactInput {
    email:    String
    forMedia: String
  }

  input DonateInput {
    cashapp:  String
    venmo:    String
    zelle:    String
    gofundme: String
    message:  String
  }

  input StatInput {
    label: String!
    value: String!
    unit:  String
    order: Int
  }

  input AchievementInput {
    title:       String!
    description: String!
    date:        String!
    medal:       MedalType!
    order:       Int
  }

  input GalleryPhotoInput {
    caption:  String!
    category: PhotoCategory!
    date:     String!
    url:      String
  }

  input EventInput {
    title:    String!
    date:     String!
    location: String!
    type:     EventType!
    order:    Int
  }

  input VideoHighlightInput {
    title:     String!
    url:       String!
    embedUrl:  String!
    thumbnail: String
    category:  VideoCategory!
    featured:  Boolean
    order:     Int
  }

  input SponsorInput {
    name:        String!
    tier:        SponsorTier!
    logoUrl:     String
    website:     String
    description: String
    order:       Int
    active:      Boolean
  }

  input PressKitMetaInput {
    pressBio:     String
    contactName:  String
    contactEmail: String
  }

  input PressKitAssetInput {
    label: String!
    type:  PressAssetType!
    url:   String!
  }

  input ContactFormInput {
    name:    String!
    email:   String!
    subject: String!
    message: String!
  }

  input BlogPostInput {
    title:     String!
    slug:      String!
    excerpt:   String!
    content:   String!
    coverUrl:  String
    category:  BlogCategory!
    tags:      [String!]
    published: Boolean
    featured:  Boolean
    order:     Int
  }

  input SocialPostInput {
    platform:  SocialPlatform!
    imageUrl:  String!
    caption:   String!
    postUrl:   String!
    likes:     Int
    published: Boolean
    featured:  Boolean
    order:     Int
    postedAt:  String
  }

  input SupporterMessageInput {
    name:     String!
    location: String
    amount:   String
    message:  String!
    platform: String
    emoji:    String
  }

  # ── Mutations ──────────────────────────────────────────────────────────────
  type Mutation {
    # Auth
    login(password: String!): AuthPayload!

    # Site content
    updateHero(input: HeroInput!):       Hero!
    updateBio(input: BioInput!):         Bio!
    updateSocial(input: SocialInput!):   Social!
    updateContact(input: ContactInput!): Contact!
    updateDonate(input: DonateInput!):   Donate!

    # Stats
    upsertStats(stats: [StatInput!]!): [Stat!]!

    # Achievements
    createAchievement(input: AchievementInput!): Achievement!
    updateAchievement(id: String!, input: AchievementInput!): Achievement!
    deleteAchievement(id: String!): Boolean!

    # Gallery — local file upload
    uploadGalleryPhoto(file: Upload!, input: GalleryPhotoInput!): GalleryPhoto!
    # Gallery — external URL
    addGalleryPhotoUrl(input: GalleryPhotoInput!): GalleryPhoto!
    deleteGalleryPhoto(id: String!): Boolean!

    # Events
    createEvent(input: EventInput!): Event!
    updateEvent(id: String!, input: EventInput!): Event!
    deleteEvent(id: String!): Boolean!

    # Site images — local upload
    uploadSiteImage(file: Upload!, type: ImageType!): SiteImage!
    # Site images — external URL
    setSiteImageUrl(url: String!, type: ImageType!): SiteImage!
    removeSiteImage(type: ImageType!): Boolean!

    # Contact form — public
    sendContactEmail(input: ContactFormInput!): Boolean!

    # Press kit
    updatePressKitMeta(input: PressKitMetaInput!):     PressKitMeta!
    addPressKitAssetUrl(input: PressKitAssetInput!):   PressKitAsset!
    deletePressKitAsset(id: String!):                  Boolean!
    reorderPressKitAssets(ids: [String!]!):            [PressKitAsset!]!

    # Sponsors
    createSponsor(input: SponsorInput!):               Sponsor!
    updateSponsor(id: String!, input: SponsorInput!):  Sponsor!
    deleteSponsor(id: String!):                        Boolean!
    reorderSponsors(ids: [String!]!):                  [Sponsor!]!

    # Videos
    createVideo(input: VideoHighlightInput!):                    VideoHighlight!
    updateVideo(id: String!, input: VideoHighlightInput!):       VideoHighlight!
    deleteVideo(id: String!):                                    Boolean!
    reorderVideos(ids: [String!]!):                              [VideoHighlight!]!

    # Blog / News
    createBlogPost(input: BlogPostInput!):                       BlogPost!
    updateBlogPost(id: String!, input: BlogPostInput!):          BlogPost!
    deleteBlogPost(id: String!):                                 Boolean!
    publishBlogPost(id: String!):                                BlogPost!
    unpublishBlogPost(id: String!):                              BlogPost!
    reorderBlogPosts(ids: [String!]!):                           [BlogPost!]!

    # Social feed
    createSocialPost(input: SocialPostInput!):                   SocialPost!
    updateSocialPost(id: String!, input: SocialPostInput!):      SocialPost!
    deleteSocialPost(id: String!):                               Boolean!
    reorderSocialPosts(ids: [String!]!):                         [SocialPost!]!

    # Supporter wall
    submitSupporterMessage(input: SupporterMessageInput!):       SupporterMessage!
    approveSupporterMessage(id: String!):                        SupporterMessage!
    featureSupporterMessage(id: String!):                        SupporterMessage!
    pinSupporterMessage(id: String!, pinned: Boolean!):          SupporterMessage!
    deleteSupporterMessage(id: String!):                         Boolean!
  }
`;
