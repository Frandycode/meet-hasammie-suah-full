/**
 * Meet HaSammie Suah — Frontend
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import React, { createContext, useContext } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { apolloClient } from '../lib/apolloClient';
import {
  GET_SITE_DATA,
  UPDATE_HERO, UPDATE_BIO, UPDATE_SOCIAL, UPDATE_CONTACT, UPDATE_DONATE,
  UPSERT_STATS,
  CREATE_ACHIEVEMENT, UPDATE_ACHIEVEMENT, DELETE_ACHIEVEMENT,
  UPLOAD_GALLERY_PHOTO, ADD_GALLERY_PHOTO_URL, DELETE_GALLERY_PHOTO,
  CREATE_EVENT, UPDATE_EVENT, DELETE_EVENT,
  UPLOAD_SITE_IMAGE, SET_SITE_IMAGE_URL, REMOVE_SITE_IMAGE,
} from '../lib/queries';

export interface Achievement {
  id: string; title: string; description: string;
  date: string; medal?: 'gold' | 'silver' | 'bronze';
}

export interface GalleryPhoto {
  id: string; url: string; caption: string;
  category: 'race' | 'training' | 'team' | 'awards' | 'personal';
  date: string;
}

export interface Stat { label: string; value: string; unit?: string; }

export interface UpcomingEvent {
  id: string; title: string; date: string;
  location: string; type: 'meet' | 'championship' | 'training' | 'other';
}

export interface DonateInfo {
  cashapp: string; venmo: string; zelle: string;
  gofundme: string; message: string;
}

export interface SiteData {
  hero:         { tagline: string; subtitle: string; quote: string; };
  bio:          { intro: string; story: string; coachNote: string; coachName: string; };
  stats:        Stat[];
  achievements: Achievement[];
  gallery:      GalleryPhoto[];
  events:       UpcomingEvent[];
  donate:       DonateInfo;
  social:       { instagram?: string; twitter?: string; tiktok?: string; };
  contact:      { email: string; forMedia: string; };
  profilePhoto: string;
  heroPhoto:    string;
}

const medalMap: Record<string, 'gold' | 'silver' | 'bronze'> = {
  GOLD: 'gold', SILVER: 'silver', BRONZE: 'bronze',
};
const medalRev: Record<string, string> = {
  gold: 'GOLD', silver: 'SILVER', bronze: 'BRONZE',
};
const catRev: Record<string, string> = {
  race: 'RACE', training: 'TRAINING', team: 'TEAM', awards: 'AWARDS', personal: 'PERSONAL',
};
const evtRev: Record<string, string> = {
  meet: 'MEET', championship: 'CHAMPIONSHIP', training: 'TRAINING', other: 'OTHER',
};

const defaultData: SiteData = {
  hero:    { tagline: '', subtitle: '', quote: '' },
  bio:     { intro: '', story: '', coachNote: '', coachName: '' },
  stats: [], achievements: [], gallery: [], events: [],
  donate:  { cashapp: '', venmo: '', zelle: '', gofundme: '', message: '' },
  social:  {}, contact: { email: '', forMedia: '' },
  profilePhoto: '', heroPhoto: '',
};

function transform(apiData: any): SiteData {
  if (!apiData?.siteData) return defaultData;
  const d = apiData.siteData;
  return {
    hero:    { tagline: d.hero?.tagline||'', subtitle: d.hero?.subtitle||'', quote: d.hero?.quote||'' },
    bio:     { intro: d.bio?.intro||'', story: d.bio?.story||'', coachNote: d.bio?.coachNote||'', coachName: d.bio?.coachName||'' },
    stats:   (d.stats||[]).map((s: any) => ({ label: s.label, value: s.value, unit: s.unit })),
    achievements: (d.achievements||[]).map((a: any) => ({
      id: a.id, title: a.title, description: a.description,
      date: a.date, medal: medalMap[a.medal]||'bronze',
    })),
    gallery: (d.gallery||[]).map((p: any) => ({
      id: p.id, url: p.publicUrl||'', caption: p.caption,
      category: (p.category as string).toLowerCase() as GalleryPhoto['category'],
      date: p.date,
    })),
    events: (d.events||[]).map((e: any) => ({
      id: e.id, title: e.title, date: e.date,
      location: e.location, type: (e.type as string).toLowerCase() as UpcomingEvent['type'],
    })),
    donate:  { cashapp: d.donate?.cashapp||'', venmo: d.donate?.venmo||'', zelle: d.donate?.zelle||'', gofundme: d.donate?.gofundme||'', message: d.donate?.message||'' },
    social:  { instagram: d.social?.instagram||'', twitter: d.social?.twitter||'', tiktok: d.social?.tiktok||'' },
    contact: { email: d.contact?.email||'', forMedia: d.contact?.forMedia||'' },
    profilePhoto: d.profileImage?.publicUrl||'',
    heroPhoto:    d.heroImage?.publicUrl||'',
  };
}

interface SiteContextType {
  data: SiteData; loading: boolean; error: string | null; refetch: () => void;
  updateHero:    (h: Partial<SiteData['hero']>) => Promise<void>;
  updateBio:     (b: Partial<SiteData['bio']>)  => Promise<void>;
  updateStats:   (s: Stat[]) => Promise<void>;
  updateSocial:  (s: Partial<SiteData['social']>) => Promise<void>;
  updateContact: (c: Partial<SiteData['contact']>) => Promise<void>;
  updateDonate:  (d: Partial<DonateInfo>) => Promise<void>;
  addAchievement:     (a: Omit<Achievement,'id'>) => Promise<void>;
  updateAchievement:  (id: string, a: Partial<Achievement>) => Promise<void>;
  deleteAchievement:  (id: string) => Promise<void>;
  uploadGalleryPhoto: (file: File, meta: Omit<GalleryPhoto,'id'|'url'>) => Promise<void>;
  addGalleryPhotoUrl: (url: string, meta: Omit<GalleryPhoto,'id'|'url'>) => Promise<void>;
  deleteGalleryPhoto: (id: string) => Promise<void>;
  addEvent:    (e: Omit<UpcomingEvent,'id'>) => Promise<void>;
  updateEvent: (id: string, e: Partial<UpcomingEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  uploadSiteImage: (file: File, type: 'PROFILE'|'HERO_BG') => Promise<void>;
  setSiteImageUrl: (url: string, type: 'PROFILE'|'HERO_BG') => Promise<void>;
  removeSiteImage: (type: 'PROFILE'|'HERO_BG') => Promise<void>;
  setProfilePhoto: (url: string) => Promise<void>;
  setHeroPhoto:    (url: string) => Promise<void>;
}

const SiteContext = createContext<SiteContextType | null>(null);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: apiData, loading, error, refetch } = useQuery(GET_SITE_DATA, {
    client: apolloClient, errorPolicy: 'all',
  });

  const opts = { client: apolloClient };
  const [mutHero]       = useMutation(UPDATE_HERO,            opts);
  const [mutBio]        = useMutation(UPDATE_BIO,             opts);
  const [mutSocial]     = useMutation(UPDATE_SOCIAL,          opts);
  const [mutContact]    = useMutation(UPDATE_CONTACT,         opts);
  const [mutDonate]     = useMutation(UPDATE_DONATE,          opts);
  const [mutStats]      = useMutation(UPSERT_STATS,           opts);
  const [mutCreateA]    = useMutation(CREATE_ACHIEVEMENT,     opts);
  const [mutUpdateA]    = useMutation(UPDATE_ACHIEVEMENT,     opts);
  const [mutDeleteA]    = useMutation(DELETE_ACHIEVEMENT,     opts);
  const [mutUploadG]    = useMutation(UPLOAD_GALLERY_PHOTO,   opts);
  const [mutAddGUrl]    = useMutation(ADD_GALLERY_PHOTO_URL,  opts);
  const [mutDeleteG]    = useMutation(DELETE_GALLERY_PHOTO,   opts);
  const [mutCreateE]    = useMutation(CREATE_EVENT,           opts);
  const [mutUpdateE]    = useMutation(UPDATE_EVENT,           opts);
  const [mutDeleteE]    = useMutation(DELETE_EVENT,           opts);
  const [mutUploadImg]  = useMutation(UPLOAD_SITE_IMAGE,      opts);
  const [mutSetImgUrl]  = useMutation(SET_SITE_IMAGE_URL,     opts);
  const [mutRemoveImg]  = useMutation(REMOVE_SITE_IMAGE,      opts);

  const data   = transform(apiData);
  const r      = () => refetch();
  const errMsg = error?.message || null;

  const updateHero    = async (h: any) => { await mutHero({ variables: { input: h } }); r(); };
  const updateBio     = async (b: any) => { await mutBio({ variables: { input: b } }); r(); };
  const updateSocial  = async (s: any) => { await mutSocial({ variables: { input: s } }); r(); };
  const updateContact = async (c: any) => { await mutContact({ variables: { input: c } }); r(); };
  const updateDonate  = async (d: any) => { await mutDonate({ variables: { input: d } }); r(); };
  const updateStats   = async (stats: Stat[]) => {
    await mutStats({ variables: { stats: stats.map((s,i) => ({ ...s, order: i })) } }); r();
  };

  const addAchievement = async (a: Omit<Achievement,'id'>) => {
    await mutCreateA({ variables: { input: { ...a, medal: medalRev[a.medal||'bronze'] } } }); r();
  };
  const updateAchievement = async (id: string, a: Partial<Achievement>) => {
    const ex = data.achievements.find(x => x.id === id);
    if (!ex) return;
    const m = { ...ex, ...a };
    await mutUpdateA({ variables: { id, input: { title: m.title, description: m.description, date: m.date, medal: medalRev[m.medal||'bronze'] } } }); r();
  };
  const deleteAchievement = async (id: string) => { await mutDeleteA({ variables: { id } }); r(); };

  const uploadGalleryPhoto = async (file: File, meta: Omit<GalleryPhoto,'id'|'url'>) => {
    await mutUploadG({ variables: { file, input: { caption: meta.caption, category: catRev[meta.category], date: meta.date } } }); r();
  };
  const addGalleryPhotoUrl = async (url: string, meta: Omit<GalleryPhoto,'id'|'url'>) => {
    await mutAddGUrl({ variables: { input: { caption: meta.caption, category: catRev[meta.category], date: meta.date, url } } }); r();
  };
  const deleteGalleryPhoto = async (id: string) => { await mutDeleteG({ variables: { id } }); r(); };

  const addEvent = async (e: Omit<UpcomingEvent,'id'>) => {
    await mutCreateE({ variables: { input: { ...e, type: evtRev[e.type] } } }); r();
  };
  const updateEvent = async (id: string, e: Partial<UpcomingEvent>) => {
    const ex = data.events.find(x => x.id === id);
    if (!ex) return;
    const m = { ...ex, ...e };
    await mutUpdateE({ variables: { id, input: { title: m.title, date: m.date, location: m.location, type: evtRev[m.type] } } }); r();
  };
  const deleteEvent = async (id: string) => { await mutDeleteE({ variables: { id } }); r(); };

  const uploadSiteImage = async (file: File, type: 'PROFILE'|'HERO_BG') => {
    await mutUploadImg({ variables: { file, type } }); r();
  };
  const setSiteImageUrl = async (url: string, type: 'PROFILE'|'HERO_BG') => {
    await mutSetImgUrl({ variables: { url, type } }); r();
  };
  const removeSiteImage = async (type: 'PROFILE'|'HERO_BG') => {
    await mutRemoveImg({ variables: { type } }); r();
  };

  const setProfilePhoto = (url: string) => setSiteImageUrl(url, 'PROFILE');
  const setHeroPhoto    = (url: string) => setSiteImageUrl(url, 'HERO_BG');

  return (
    <SiteContext.Provider value={{
      data, loading, error: errMsg, refetch: r,
      updateHero, updateBio, updateStats, updateSocial, updateContact, updateDonate,
      addAchievement, updateAchievement, deleteAchievement,
      uploadGalleryPhoto, addGalleryPhotoUrl, deleteGalleryPhoto,
      addEvent, updateEvent, deleteEvent,
      uploadSiteImage, setSiteImageUrl, removeSiteImage,
      setProfilePhoto, setHeroPhoto,
    }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
};
