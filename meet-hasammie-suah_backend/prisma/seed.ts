/**
 * Meet HaSammie Suah — Backend API
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin account ──────────────────────────────────────────────────────────
  const adminPassword = process.env.ADMIN_PASSWORD || 'sammie2009';
  const passwordHash  = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.admin.upsert({
    where:  { username: 'sammie' },
    update: { passwordHash },
    create: { username: 'sammie', passwordHash },
  });
  console.log(`✅ Admin created: ${admin.username}`);

  // ── Hero ───────────────────────────────────────────────────────────────────
  await prisma.siteHero.upsert({
    where:  { id: 'default' },
    update: {},
    create: {
      id:       'default',
      tagline:  'Born to Run. Built to Win.',
      subtitle: 'Top 5 Track Runner in the State of Oklahoma',
      quote:    '"Every step is a statement. Every finish line, a promise."',
    },
  });

  // ── Bio ────────────────────────────────────────────────────────────────────
  await prisma.siteBio.upsert({
    where:  { id: 'default' },
    update: {},
    create: {
      id:        'default',
      intro:     "Sammie Suah isn't just a runner — she's a force of nature. At 16, this Union High School junior has already carved her name into Oklahoma track history.",
      story:     "Growing up in Tulsa, Oklahoma, Sammie discovered her love for running at age 10 during a school field day. What started as a natural gift quickly became a disciplined pursuit of excellence. Through early mornings, grueling practices, and unwavering dedication, she transformed raw talent into championship-level performance.",
      coachNote: "Sammie is one of those rare athletes who combines natural ability with an unmatched work ethic. She's coachable, driven, and has the mental fortitude of someone far beyond her years.",
      coachName: 'Coach [Name] · Union High School Track & Field',
    },
  });

  // ── Social ─────────────────────────────────────────────────────────────────
  await prisma.siteSocial.upsert({
    where:  { id: 'default' },
    update: {},
    create: { id: 'default', instagram: '@sammie.runs', twitter: '@sammiesuah', tiktok: '@sammiesuah' },
  });

  // ── Contact ────────────────────────────────────────────────────────────────
  await prisma.siteContact.upsert({
    where:  { id: 'default' },
    update: {},
    create: { id: 'default', email: 'sammie@example.com', forMedia: 'media@example.com' },
  });

  // ── Donate ─────────────────────────────────────────────────────────────────
  await prisma.siteDonate.upsert({
    where:  { id: 'default' },
    update: {},
    create: {
      id:      'default',
      cashapp: '$SammieSuah',
      venmo:   '@Sammie-Suah',
      zelle:   'sammie@example.com',
      message: "Help fuel Sammie's journey to the top. Every contribution goes toward training, equipment, travel to meets, and chasing her dreams.",
    },
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = [
    { label: '100m Personal Best', value: '11.8', unit: 'sec',      order: 0 },
    { label: '200m Personal Best', value: '24.3', unit: 'sec',      order: 1 },
    { label: 'State Ranking',      value: 'Top 5',unit: 'Oklahoma', order: 2 },
    { label: 'Years Competing',    value: String(new Date().getFullYear() - 2023), unit: 'years', order: 3 },
    { label: 'Meets Won',          value: '12+',  unit: 'victories',order: 4 },
    { label: 'Grade',              value: '11th', unit: 'Union HS', order: 5 },
  ];

  await prisma.stat.deleteMany();
  await prisma.stat.createMany({ data: stats });
  console.log(`✅ ${stats.length} stats seeded`);

  // ── Achievements ───────────────────────────────────────────────────────────
  const achievements = [
    { title: 'Top 5 State Ranking — Oklahoma',  description: 'Ranked among the top 5 high school track runners in the entire state.',           date: '2025', medal: 'GOLD'   as const, order: 0 },
    { title: 'Regional Championship — 1st Place',description: 'Dominated the regional meet, crossing first in the 100m event.',                  date: '2024', medal: 'GOLD'   as const, order: 1 },
    { title: 'District Champion — 200m',         description: 'Claimed the district title in the 200m sprint, setting a new personal record.',    date: '2024', medal: 'GOLD'   as const, order: 2 },
    { title: 'Union High School MVP',            description: 'Named Most Valuable Player for the track & field program.',                        date: '2024', medal: 'SILVER' as const, order: 3 },
    { title: 'All-Academic Athlete Award',       description: 'Recognized for excellence both on the track and in the classroom.',                date: '2024', medal: 'BRONZE' as const, order: 4 },
  ];

  await prisma.achievement.deleteMany();
  await prisma.achievement.createMany({ data: achievements });
  console.log(`✅ ${achievements.length} achievements seeded`);

  // ── Events ─────────────────────────────────────────────────────────────────
  await prisma.event.deleteMany();
  await prisma.event.createMany({
    data: [
      { title: 'Tulsa Invitational Spring Meet',               date: new Date('2025-04-12'), location: 'Tulsa, OK',        type: 'MEET',         order: 0 },
      { title: 'District Championship Qualifier',              date: new Date('2025-04-26'), location: 'Broken Arrow, OK', type: 'CHAMPIONSHIP', order: 1 },
      { title: 'Oklahoma State High School Track Championships',date: new Date('2025-05-15'), location: 'Edmond, OK',       type: 'CHAMPIONSHIP', order: 2 },
      { title: 'Summer Elite Speed Camp',                      date: new Date('2025-06-20'), location: 'Oklahoma City, OK',type: 'TRAINING',     order: 3 },
    ],
  });
  console.log('✅ Events seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log(`\n🔐 Admin login: username=sammie, password=${adminPassword}`);
}

main()
  .catch(e => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
