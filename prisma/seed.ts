import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth';
import * as path from 'path';

const prisma = new PrismaClient();

const ALEGRIA_OFFICIALS = [
  // Barangay
  { name: 'Juan Dela Cruz', position: 'Barangay Captain', type: 'BARANGAY', hierarchyOrder: 1, barangayName: 'Alegria' },
  { name: 'Maria Santos', position: 'Barangay Kagawad 1', type: 'BARANGAY', hierarchyOrder: 2, barangayName: 'Alegria' },
  { name: 'Pedro Reyes', position: 'Barangay Kagawad 2', type: 'BARANGAY', hierarchyOrder: 3, barangayName: 'Alegria' },
  { name: 'Ana Garcia', position: 'Barangay Kagawad 3', type: 'BARANGAY', hierarchyOrder: 4, barangayName: 'Alegria' },
  { name: 'Jose Rodriguez', position: 'Barangay Kagawad 4', type: 'BARANGAY', hierarchyOrder: 5, barangayName: 'Alegria' },
  { name: 'Carmen Lopez', position: 'Barangay Kagawad 5', type: 'BARANGAY', hierarchyOrder: 6, barangayName: 'Alegria' },
  { name: 'Ricardo Martinez', position: 'Barangay Kagawad 6', type: 'BARANGAY', hierarchyOrder: 7, barangayName: 'Alegria' },
  { name: 'Miguel Torres', position: 'Barangay Kagawad 7', type: 'BARANGAY', hierarchyOrder: 8, barangayName: 'Alegria' },
  // SK
  { name: 'Miguel Torres', position: 'SK Chairperson', type: 'SK', hierarchyOrder: 1, barangayName: 'Alegria' },
  { name: 'Sofia Ramos', position: 'SK Kagawad 1', type: 'SK', hierarchyOrder: 2, barangayName: 'Alegria' },
  { name: 'Luis Hernandez', position: 'SK Kagawad 2', type: 'SK', hierarchyOrder: 3, barangayName: 'Alegria' }
];

const PILIPOG_OFFICIALS = [
  // Barangay
  { name: 'Mariano Jimenez', position: 'Barangay Captain', type: 'BARANGAY', hierarchyOrder: 1, barangayName: 'Pilipog' },
  { name: 'Felicidad Ortega', position: 'Barangay Kagawad 1', type: 'BARANGAY', hierarchyOrder: 2, barangayName: 'Pilipog' },
  { name: 'Alejandro Valdez', position: 'Barangay Kagawad 2', type: 'BARANGAY', hierarchyOrder: 3, barangayName: 'Pilipog' },
  { name: 'Delia Gutierrez', position: 'Barangay Kagawad 3', type: 'BARANGAY', hierarchyOrder: 4, barangayName: 'Pilipog' },
  { name: 'Raul Romero', position: 'Barangay Kagawad 4', type: 'BARANGAY', hierarchyOrder: 5, barangayName: 'Pilipog' },
  { name: 'Leonor Ramirez', position: 'Barangay Kagawad 5', type: 'BARANGAY', hierarchyOrder: 6, barangayName: 'Pilipog' },
  { name: 'Claudio Suarez', position: 'Barangay Kagawad 6', type: 'BARANGAY', hierarchyOrder: 7, barangayName: 'Pilipog' },
  // SK
  { name: 'Aurora Velasco', position: 'SK Chairperson', type: 'SK', hierarchyOrder: 1, barangayName: 'Pilipog' }
];

const EXTRA_MUNICIPAL_OFFICIALS = [
  { name: 'Hon. Teodorico R. Casquejo Jr.', position: 'Sangguniang Bayan Member', type: 'MUNICIPAL', hierarchyOrder: 3 },
  { name: 'Hon. Chito P. Bentazal', position: 'Sangguniang Bayan Member', type: 'MUNICIPAL', hierarchyOrder: 4 }
];

async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.official.findUnique({ where: { slug } });
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function seedOfficial(data: {
  name: string;
  position: string;
  type: string;
  hierarchyOrder: number;
  barangayName?: string;
  imageUrl?: string | null;
}) {
  const existing = await prisma.official.findFirst({
    where: {
      name: data.name,
      type: data.type,
      barangayName: data.barangayName || null,
      position: data.position
    }
  });

  if (!existing) {
    const slug = await generateUniqueSlug(data.name);
    await prisma.official.create({
      data: {
        name: data.name,
        position: data.position,
        slug,
        type: data.type,
        hierarchyOrder: data.hierarchyOrder,
        imageUrl: data.imageUrl || null,
        barangayName: data.barangayName || null
      }
    });
    console.log(`Seeded Unified Official: ${data.name} (${data.position})`);
  }
}

async function main() {
  console.log('Seeding data...');

  // 1. Seed Municipal Officials (Older Model - For Safety/Backwards Compatibility)
  await prisma.municipalOfficial.createMany({
    data: [
      {
        name: 'Hon. Cesar E. Suan',
        position: 'Municipal Mayor',
        hierarchyOrder: 1,
        imageUrl: 'https://cordova.gov.ph/wp-content/uploads/2023/04/MAYOR-SUAN.jpg',
      },
      {
        name: 'Hon. Victor T. Tago',
        position: 'Municipal Vice Mayor',
        hierarchyOrder: 2,
        imageUrl: 'https://cordova.gov.ph/wp-content/uploads/2023/04/VM-TAGO.jpg',
      },
      {
        name: 'Hon. Teodorico R. Casquejo Jr.',
        position: 'Sangguniang Bayan Member',
        hierarchyOrder: 3,
      },
      {
        name: 'Hon. Chito P. Bentazal',
        position: 'Sangguniang Bayan Member',
        hierarchyOrder: 4,
      }
    ],
    skipDuplicates: true,
  });

  // 2. Seed Barangay Officials (Older Model - For Safety/Backwards Compatibility)
  await prisma.barangayOfficial.createMany({
    data: [
      {
        name: 'Juan Dela Cruz',
        position: 'Barangay Captain',
        hierarchyOrder: 1,
        barangayName: 'Alegria',
      },
      {
        name: 'Maria Santos',
        position: 'Barangay Kagawad',
        hierarchyOrder: 2,
        barangayName: 'Alegria',
      },
      {
        name: 'Pedro Penduko',
        position: 'Barangay Kagawad',
        hierarchyOrder: 3,
        barangayName: 'Alegria',
      }
    ],
    skipDuplicates: true,
  });

  // 3. Seed Services
  await prisma.service.createMany({
    data: [
      {
        name: 'Business Permit Registration',
        description: 'Apply for a new business permit or renew an existing one.',
        icon: 'Building2',
        category: 'Business',
        processSteps: JSON.stringify(['Submit documents', 'Assessment', 'Payment', 'Claim Permit']),
        fee: 'Variable based on capitalization',
        requirements: JSON.stringify(['DTI/SEC Registration', 'Barangay Clearance', 'Zoning Clearance', 'Sanitary Permit']),
      },
      {
        name: 'Mayor\'s Clearance',
        description: 'Secure a Mayor\'s Clearance for employment or legal purposes.',
        icon: 'FileText',
        category: 'Clearances',
        processSteps: JSON.stringify(['Present Police Clearance', 'Payment', 'Processing', 'Claim Clearance']),
        fee: 'PHP 100.00',
        requirements: JSON.stringify(['Valid Police Clearance', 'Community Tax Certificate (Cedula)', 'Official Receipt']),
      }
    ],
    skipDuplicates: true,
  });

  // 4. Seed Emergency Hotlines
  await prisma.emergencyHotline.createMany({
    data: [
      {
        title: 'Cordova Police Station',
        description: 'Local police force for security, law enforcement, and emergency protection.',
        contact: '0998-598-6392',
        category: 'Security',
        icon: 'ShieldCheck',
      },
      {
        title: 'Bureau of Fire Protection',
        description: 'Fire safety, prevention, suppression, and emergency rescue operations.',
        contact: '436-4245 / 0933-394-9073',
        category: 'Fire & Rescue',
        icon: 'Flame',
      },
      {
        title: 'Cordova Primary Health Care Facility (ABTC, Birthing Center, Medical Section)',
        description: 'Primary medical services, birthing assistance, and animal bite treatment center.',
        contact: '0967-491-5579',
        category: 'Medical',
        icon: 'Cross',
      },
      {
        title: 'Cordova Primary Health Care Facility Ambulance Services (8:00 AM - 5:00 PM)',
        description: 'Daytime patient transport and emergency ambulance medical assistance.',
        contact: '0967-491-5579',
        category: 'Medical',
        icon: 'Ambulance',
      },
      {
        title: 'MDRRMO Ambulance (24/7)',
        description: '24/7 disaster risk reduction and management office emergency ambulance response.',
        contact: '0917-149-8457 / 0917-116-9819',
        category: 'Medical',
        icon: 'Ambulance',
      },
      {
        title: 'Philippine Red Cross (Lapu-Lapu & Cordova Chapter)',
        description: 'Blood services, emergency disaster relief, and volunteer medical support.',
        contact: '0969-450-8482',
        category: 'Medical',
        icon: 'Cross',
      },
      {
        title: 'Philippine Coast Guard (Cordova)',
        description: 'Search and rescue at sea, maritime security, and marine environment protection.',
        contact: '0927-941-2486',
        category: 'Maritime',
        icon: 'Anchor',
      }
    ],
    skipDuplicates: true,
  });

  // 5. Seed Unified Official Table from Excel and Word Documents
  console.log('Parsing Excel & Word Documents for Unified Officials Seeding...');

  // A. Parse Excel for Barangay & SK Officials
  const excelPath = path.join(__dirname, '../../Barangay Officials and SK Officials.xlsx');
  const workbook = XLSX.readFile(excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  for (let i = 1; i < excelData.length; i++) {
    const row = excelData[i];
    if (!row || row.length === 0) continue;

    const barangayNameRaw = row[0];
    if (!barangayNameRaw) continue;

    const barangayName = barangayNameRaw.trim();
    if (!barangayName) continue;

    const isAlegria = barangayName.toLowerCase() === 'alegria';
    const isPilipog = barangayName.toLowerCase() === 'pilipog';

    // Fallbacks if columns are empty
    if (isAlegria && (row.length <= 1 || !row[1] || row[1].trim() === '')) {
      console.log('Seeding Alegria using fallback mock data...');
      for (const official of ALEGRIA_OFFICIALS) {
        await seedOfficial(official);
      }
      continue;
    }

    if (isPilipog && (row.length <= 1 || !row[1] || row[1].trim() === '')) {
      console.log('Seeding Pilipog using fallback mock data...');
      for (const official of PILIPOG_OFFICIALS) {
        await seedOfficial(official);
      }
      continue;
    }

    // Punong Barangay
    if (row[1] && row[1].trim() && row[1].trim().toUpperCase() !== 'VACANT') {
      await seedOfficial({
        name: row[1].trim(),
        position: 'Barangay Captain',
        type: 'BARANGAY',
        hierarchyOrder: 1,
        barangayName
      });
    }

    // Barangay Kagawads (Col 2 to 8)
    for (let col = 2; col <= 8; col++) {
      const val = row[col];
      if (val && val.trim() && val.trim().toUpperCase() !== 'VACANT') {
        await seedOfficial({
          name: val.trim(),
          position: `Barangay Kagawad ${col - 1}`,
          type: 'BARANGAY',
          hierarchyOrder: col,
          barangayName
        });
      }
    }

    // Barangay Secretary (Col 9)
    if (row[9] && row[9].trim() && row[9].trim().toUpperCase() !== 'VACANT') {
      await seedOfficial({
        name: row[9].trim(),
        position: 'Barangay Secretary',
        type: 'BARANGAY',
        hierarchyOrder: 9,
        barangayName
      });
    }

    // Barangay Treasurer (Col 10)
    if (row[10] && row[10].trim() && row[10].trim().toUpperCase() !== 'VACANT') {
      await seedOfficial({
        name: row[10].trim(),
        position: 'Barangay Treasurer',
        type: 'BARANGAY',
        hierarchyOrder: 10,
        barangayName
      });
    }

    // SK Chairperson (Col 11)
    if (row[11] && row[11].trim() && row[11].trim().toUpperCase() !== 'VACANT') {
      await seedOfficial({
        name: row[11].trim(),
        position: 'SK Chairperson',
        type: 'SK',
        hierarchyOrder: 1,
        barangayName
      });
    }

    // SK Kagawads (Col 12 to 18)
    for (let col = 12; col <= 18; col++) {
      const val = row[col];
      if (val && val.trim() && val.trim().toUpperCase() !== 'VACANT') {
        await seedOfficial({
          name: val.trim(),
          position: `SK Kagawad ${col - 11}`,
          type: 'SK',
          hierarchyOrder: col - 10,
          barangayName
        });
      }
    }

    // SK Secretary (Col 19)
    if (row[19] && row[19].trim() && row[19].trim().toUpperCase() !== 'VACANT') {
      await seedOfficial({
        name: row[19].trim(),
        position: 'SK Secretary',
        type: 'SK',
        hierarchyOrder: 9,
        barangayName
      });
    }

    // SK Treasurer (Col 20)
    if (row[20] && row[20].trim() && row[20].trim().toUpperCase() !== 'VACANT') {
      await seedOfficial({
        name: row[20].trim(),
        position: 'SK Treasurer',
        type: 'SK',
        hierarchyOrder: 10,
        barangayName
      });
    }
  }

  // B. Parse Word Doc for Municipal and Department Officials
  const docxPath = path.join(__dirname, '../../LIST-Department-Head-Per-Office.docx');
  const wordResult = await mammoth.convertToHtml({ path: docxPath });
  const html = wordResult.value;

  const trRegex = /<tr>([\s\S]*?)<\/tr>/g;
  const tdRegex = /<td>([\s\S]*?)<\/td>/g;
  let trMatch;
  let deptHeadCount = 0;

  while ((trMatch = trRegex.exec(html)) !== null) {
    const trContent = trMatch[1];
    const tds: string[] = [];
    let tdMatch;

    while ((tdMatch = tdRegex.exec(trContent)) !== null) {
      const text = tdMatch[1].replace(/<\/?[^>]+(>|$)/g, "").replace(/&nbsp;/g, " ").trim();
      tds.push(text);
    }

    if (tds.length >= 3) {
      const dept = tds[0];
      const name = tds[1];
      const designation = tds[2];

      // Skip table header row
      if (name.toLowerCase() === 'head officer' || dept.toLowerCase() === 'department') {
        continue;
      }

      if (!name || name.toUpperCase() === 'VACANT') {
        continue;
      }

      deptHeadCount++;

      let type = 'DEPARTMENT';
      let hierarchyOrder = deptHeadCount + 2; // Position department heads after Mayor & Vice Mayor
      let imageUrl = null;

      if (designation.toLowerCase().includes('municipal mayor')) {
        type = 'MUNICIPAL';
        hierarchyOrder = 1;
        imageUrl = 'https://cordova.gov.ph/wp-content/uploads/2023/04/MAYOR-SUAN.jpg';
      } else if (designation.toLowerCase().includes('municipal vice-mayor') || designation.toLowerCase().includes('municipal vice mayor')) {
        type = 'MUNICIPAL';
        hierarchyOrder = 2;
        imageUrl = 'https://cordova.gov.ph/wp-content/uploads/2023/04/VM-TAGO.jpg';
      }

      await seedOfficial({
        name,
        position: designation,
        type,
        hierarchyOrder,
        imageUrl
      });
    }
  }

  // C. Seed Extra Municipal Officials (Sangguniang Bayan)
  console.log('Seeding extra Sangguniang Bayan members...');
  for (const official of EXTRA_MUNICIPAL_OFFICIALS) {
    await seedOfficial(official);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
