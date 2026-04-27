/**
 * Meet HaSammie Suah — Frontend
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import { gql } from '@apollo/client';

// ── Fragments ─────────────────────────────────────────────────────────────────
const HERO_FIELDS = gql`
  fragment HeroFields on Hero {
    id tagline subtitle quote
  }
`;

const BIO_FIELDS = gql`
  fragment BioFields on Bio {
    id intro story coachNote coachName
  }
`;

const STAT_FIELDS = gql`
  fragment StatFields on Stat {
    id label value unit order
  }
`;

const ACHIEVEMENT_FIELDS = gql`
  fragment AchievementFields on Achievement {
    id title description date medal order
  }
`;

const GALLERY_FIELDS = gql`
  fragment GalleryFields on GalleryPhoto {
    id caption category date storageType publicUrl width height order createdAt
  }
`;

const EVENT_FIELDS = gql`
  fragment EventFields on Event {
    id title date location type order
  }
`;

const SITE_IMAGE_FIELDS = gql`
  fragment SiteImageFields on SiteImage {
    id type storageType publicUrl
  }
`;

// ── Main site data query ──────────────────────────────────────────────────────
export const GET_SITE_DATA = gql`
  ${HERO_FIELDS} ${BIO_FIELDS} ${STAT_FIELDS}
  ${ACHIEVEMENT_FIELDS} ${GALLERY_FIELDS} ${EVENT_FIELDS} ${SITE_IMAGE_FIELDS}
  query GetSiteData {
    siteData {
      hero         { ...HeroFields }
      bio          { ...BioFields }
      social       { id instagram twitter tiktok }
      contact      { id email forMedia }
      donate       { id cashapp venmo zelle gofundme message }
      stats        { ...StatFields }
      achievements { ...AchievementFields }
      gallery      { ...GalleryFields }
      events       { ...EventFields }
      profileImage { ...SiteImageFields }
      heroImage    { ...SiteImageFields }
    }
  }
`;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const LOGIN = gql`
  mutation Login($password: String!) {
    login(password: $password) { token message }
  }
`;

// ── Hero ──────────────────────────────────────────────────────────────────────
export const UPDATE_HERO = gql`
  ${HERO_FIELDS}
  mutation UpdateHero($input: HeroInput!) {
    updateHero(input: $input) { ...HeroFields }
  }
`;

// ── Bio ───────────────────────────────────────────────────────────────────────
export const UPDATE_BIO = gql`
  ${BIO_FIELDS}
  mutation UpdateBio($input: BioInput!) {
    updateBio(input: $input) { ...BioFields }
  }
`;

// ── Social ────────────────────────────────────────────────────────────────────
export const UPDATE_SOCIAL = gql`
  mutation UpdateSocial($input: SocialInput!) {
    updateSocial(input: $input) { id instagram twitter tiktok }
  }
`;

// ── Contact ───────────────────────────────────────────────────────────────────
export const UPDATE_CONTACT = gql`
  mutation UpdateContact($input: ContactInput!) {
    updateContact(input: $input) { id email forMedia }
  }
`;

// ── Donate ────────────────────────────────────────────────────────────────────
export const UPDATE_DONATE = gql`
  mutation UpdateDonate($input: DonateInput!) {
    updateDonate(input: $input) { id cashapp venmo zelle gofundme message }
  }
`;

// ── Stats ─────────────────────────────────────────────────────────────────────
export const UPSERT_STATS = gql`
  ${STAT_FIELDS}
  mutation UpsertStats($stats: [StatInput!]!) {
    upsertStats(stats: $stats) { ...StatFields }
  }
`;

// ── Achievements ──────────────────────────────────────────────────────────────
export const CREATE_ACHIEVEMENT = gql`
  ${ACHIEVEMENT_FIELDS}
  mutation CreateAchievement($input: AchievementInput!) {
    createAchievement(input: $input) { ...AchievementFields }
  }
`;

export const UPDATE_ACHIEVEMENT = gql`
  ${ACHIEVEMENT_FIELDS}
  mutation UpdateAchievement($id: String!, $input: AchievementInput!) {
    updateAchievement(id: $id, input: $input) { ...AchievementFields }
  }
`;

export const DELETE_ACHIEVEMENT = gql`
  mutation DeleteAchievement($id: String!) {
    deleteAchievement(id: $id)
  }
`;

// ── Gallery ───────────────────────────────────────────────────────────────────
export const UPLOAD_GALLERY_PHOTO = gql`
  ${GALLERY_FIELDS}
  mutation UploadGalleryPhoto($file: Upload!, $input: GalleryPhotoInput!) {
    uploadGalleryPhoto(file: $file, input: $input) { ...GalleryFields }
  }
`;

export const ADD_GALLERY_PHOTO_URL = gql`
  ${GALLERY_FIELDS}
  mutation AddGalleryPhotoUrl($input: GalleryPhotoInput!) {
    addGalleryPhotoUrl(input: $input) { ...GalleryFields }
  }
`;

export const DELETE_GALLERY_PHOTO = gql`
  mutation DeleteGalleryPhoto($id: String!) {
    deleteGalleryPhoto(id: $id)
  }
`;

// ── Events ────────────────────────────────────────────────────────────────────
export const CREATE_EVENT = gql`
  ${EVENT_FIELDS}
  mutation CreateEvent($input: EventInput!) {
    createEvent(input: $input) { ...EventFields }
  }
`;

export const UPDATE_EVENT = gql`
  ${EVENT_FIELDS}
  mutation UpdateEvent($id: String!, $input: EventInput!) {
    updateEvent(id: $id, input: $input) { ...EventFields }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: String!) {
    deleteEvent(id: $id)
  }
`;

// ── Site images ───────────────────────────────────────────────────────────────
export const UPLOAD_SITE_IMAGE = gql`
  ${SITE_IMAGE_FIELDS}
  mutation UploadSiteImage($file: Upload!, $type: ImageType!) {
    uploadSiteImage(file: $file, type: $type) { ...SiteImageFields }
  }
`;

export const SET_SITE_IMAGE_URL = gql`
  ${SITE_IMAGE_FIELDS}
  mutation SetSiteImageUrl($url: String!, $type: ImageType!) {
    setSiteImageUrl(url: $url, type: $type) { ...SiteImageFields }
  }
`;

export const REMOVE_SITE_IMAGE = gql`
  mutation RemoveSiteImage($type: ImageType!) {
    removeSiteImage(type: $type)
  }
`;

// ── Analytics ─────────────────────────────────────────────────────────────────
export const ANALYTICS_STATS = gql`
  query AnalyticsStats {
    analyticsStats {
      totalViews
      uniqueSessions
      avgDurationSec
      topPages {
        page
        views
      }
      viewsLast7Days {
        date
        views
      }
    }
  }
`;

// ── Contact form ──────────────────────────────────────────────────────────────
export const SEND_CONTACT_EMAIL = gql`
  mutation SendContactEmail($input: ContactFormInput!) {
    sendContactEmail(input: $input)
  }
`;

// ── Press kit ─────────────────────────────────────────────────────────────────
export const GET_PRESS_KIT = gql`
  query GetPressKit {
    pressKit {
      meta {
        id pressBio contactName contactEmail
      }
      assets {
        id label type storageType url fileSize mimeType order
      }
    }
  }
`;

export const UPDATE_PRESS_KIT_META = gql`
  mutation UpdatePressKitMeta($input: PressKitMetaInput!) {
    updatePressKitMeta(input: $input) {
      id pressBio contactName contactEmail
    }
  }
`;

export const ADD_PRESS_KIT_ASSET_URL = gql`
  mutation AddPressKitAssetUrl($input: PressKitAssetInput!) {
    addPressKitAssetUrl(input: $input) {
      id label type url order
    }
  }
`;

export const DELETE_PRESS_KIT_ASSET = gql`
  mutation DeletePressKitAsset($id: String!) {
    deletePressKitAsset(id: $id)
  }
`;

// ── Sponsors ──────────────────────────────────────────────────────────────────
export const GET_SPONSORS = gql`
  query GetSponsors {
    sponsors {
      id name tier logoUrl website description order active
    }
  }
`;

export const CREATE_SPONSOR = gql`
  mutation CreateSponsor($input: SponsorInput!) {
    createSponsor(input: $input) {
      id name tier logoUrl website description order active
    }
  }
`;

export const UPDATE_SPONSOR = gql`
  mutation UpdateSponsor($id: String!, $input: SponsorInput!) {
    updateSponsor(id: $id, input: $input) {
      id name tier logoUrl website description order active
    }
  }
`;

export const DELETE_SPONSOR = gql`
  mutation DeleteSponsor($id: String!) {
    deleteSponsor(id: $id)
  }
`;

// ── Videos ────────────────────────────────────────────────────────────────────
export const GET_VIDEOS = gql`
  query GetVideos {
    videos {
      id title url embedUrl thumbnail category featured order
    }
  }
`;

export const CREATE_VIDEO = gql`
  mutation CreateVideo($input: VideoHighlightInput!) {
    createVideo(input: $input) {
      id title url embedUrl thumbnail category featured order
    }
  }
`;

export const UPDATE_VIDEO = gql`
  mutation UpdateVideo($id: String!, $input: VideoHighlightInput!) {
    updateVideo(id: $id, input: $input) {
      id title url embedUrl thumbnail category featured order
    }
  }
`;

export const DELETE_VIDEO = gql`
  mutation DeleteVideo($id: String!) {
    deleteVideo(id: $id)
  }
`;
