/**
 * Meet HaSammie Suah — Admin Layout
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 *
 * Sidebar navigation updated for v3 — includes all new admin pages:
 *   Blog / News, Social Feed, Supporter Wall
 * Nav items are grouped into logical sections with subtle dividers.
 */
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, BarChart2, Trophy, Image,
  Calendar, Share2, LogOut, Menu, Home, ChevronRight,
  Settings, Heart, Activity, Newspaper, Users, Video,
  BookOpen, MessageSquareHeart,
} from 'lucide-react';
import { SiInstagram } from 'react-icons/si';
import { useAuth } from '../../context/AuthContext';

// ─── Nav item types ───────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon:  React.ReactNode;
  to:    string;
}

interface NavGroup {
  heading: string;
  items:   NavItem[];
}

// ─── Navigation groups ────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Site',
    items: [
      { label: 'Dashboard',        icon: <LayoutDashboard size={16} />, to: '/admin/dashboard'       },
      { label: 'Hero & Branding',  icon: <Settings size={16} />,        to: '/admin/hero'            },
      { label: 'Biography',        icon: <User size={16} />,            to: '/admin/bio'             },
      { label: 'Stats',            icon: <BarChart2 size={16} />,       to: '/admin/stats'           },
      { label: 'Achievements',     icon: <Trophy size={16} />,          to: '/admin/achievements'    },
    ],
  },
  {
    heading: 'Media',
    items: [
      { label: 'Gallery',          icon: <Image size={16} />,           to: '/admin/gallery'         },
      { label: 'Videos',           icon: <Video size={16} />,           to: '/admin/videos'          },
      { label: 'Blog / News',      icon: <BookOpen size={16} />,        to: '/admin/blog'            },
      { label: 'Social Feed',      icon: <SiInstagram size={16} />,     to: '/admin/social-feed'     },
    ],
  },
  {
    heading: 'Events & Community',
    items: [
      { label: 'Events',           icon: <Calendar size={16} />,        to: '/admin/events'          },
      { label: 'Supporter Wall',   icon: <MessageSquareHeart size={16}/>,to: '/admin/supporter-wall' },
      { label: 'Donations',        icon: <Heart size={16} />,           to: '/admin/donate'          },
    ],
  },
  {
    heading: 'Presence',
    items: [
      { label: 'Social & Contact', icon: <Share2 size={16} />,          to: '/admin/social'          },
      { label: 'Sponsors',         icon: <Users size={16} />,           to: '/admin/sponsors'        },
      { label: 'Press Kit',        icon: <Newspaper size={16} />,       to: '/admin/press-kit'       },
      { label: 'Analytics',        icon: <Activity size={16} />,        to: '/admin/analytics'       },
    ],
  },
];

// ─── NavLink styles ───────────────────────────────────────────────────────────

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
    isActive
      ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-semibold border-l-2 border-[#D4AF37] pl-[10px]'
      : 'text-[#F5F0E8]/50 hover:bg-[#D4AF37]/8 hover:text-[#F5F0E8]/80'
  }`;

// ─── Component ────────────────────────────────────────────────────────────────

export const AdminLayout: React.FC = () => {
  const { logout }   = useAuth();
  const navigate     = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#0a1205] flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64
        bg-[#0F1A08] border-r border-[#D4AF37]/15
        flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Brand */}
        <div className="p-6 border-b border-[#D4AF37]/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#7A9B00] flex items-center justify-center text-[#0F1A08] font-black text-lg"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              S
            </div>
            <div>
              <p
                className="text-white font-bold text-sm leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                HaSammie Suah
              </p>
              <p className="text-[#D4AF37]/50 text-xs">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* View public site */}
        <div className="px-4 py-3 border-b border-[#D4AF37]/10">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 transition-colors text-[#D4AF37] text-xs font-semibold"
          >
            <Home size={14} />
            View Public Site
            <ChevronRight size={12} className="ml-auto" />
          </a>
        </div>

        {/* Grouped nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {NAV_GROUPS.map(group => (
            <div key={group.heading}>
              <p className="text-[#D4AF37]/30 text-[10px] font-bold tracking-[0.2em] uppercase px-3 mb-1.5">
                {group.heading}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    className={linkClass}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-[#D4AF37]/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header className="bg-[#0F1A08]/80 border-b border-[#D4AF37]/10 px-6 py-4 flex items-center gap-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#D4AF37]"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <p
            className="text-white font-semibold text-sm"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Admin Dashboard
          </p>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
