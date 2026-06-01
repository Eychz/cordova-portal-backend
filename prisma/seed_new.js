const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 0. Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@cordova.gov.ph' },
    update: {},
    create: {
      email: 'admin@cordova.gov.ph',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      isVerified: true,
      emailVerified: true
    }
  });

  // 1. Municipal Officials
  const officials = [
    {
      name: 'Hon. Cesar "Didoy" Suan',
      position: 'Municipal Mayor',
      slug: 'cesar-suan',
      type: 'MUNICIPAL',
      hierarchyOrder: 0,
      email: 'mayor@cordova.gov.ph'
    },
    {
      name: 'Hon. Victor "Boyet" Tago III',
      position: 'Municipal Vice Mayor',
      slug: 'victor-tago',
      type: 'MUNICIPAL',
      hierarchyOrder: 1,
      email: 'vicemayor@cordova.gov.ph'
    }
  ];

  for (const official of officials) {
    await prisma.official.upsert({
      where: { slug: official.slug },
      update: {},
      create: official
    });
  }

  // 2. Services
  const services = [
    {
      name: 'Business Permit Application',
      description: 'Application for new or renewal of business permits within the municipality.',
      icon: 'FileText',
      category: 'Business',
      fee: 'Varies',
      processingTime: '1-3 Working Days',
      email: 'bplo@cordova.gov.ph'
    },
    {
      name: 'Health Certificate Issuance',
      description: 'Issuance of health certificates for employment or other purposes.',
      icon: 'Heart',
      category: 'Health',
      fee: 'PHP 50.00',
      processingTime: '15 Minutes',
      email: 'health@cordova.gov.ph'
    }
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  // 3. Posts
  const posts = [
    {
      title: 'Grand Dinagat Festival 2026',
      content: 'Join us for the annual Dinagat Festival celebrating our rich marine heritage!',
      type: 'news',
      status: 'published',
      isFeatured: true,
      category: 'Festival'
    }
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
