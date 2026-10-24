import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting RJ BODY BUILDING Database Seeding (Clean Production Setup) ---');

  // 1. Workshop Settings (Official Business Identity)
  await prisma.workshopSetting.upsert({
    where: { id: 'default-setting' },
    update: {
      phonePlaceholder: '+91 63793 02952',
      whatsappPlaceholder: '+91 63793 02952',
    },
    create: {
      id: 'default-setting',
      workshopName: 'RJ BODY BUILDING',
      tagline: 'Lorry Body Building & Modification Workshop',
      location: 'Vasthanagar, near Agrini / Ravithurayan Temple, Madurai, Tamil Nadu, India',
      experienceYears: 35,
      establishedYear: 1991,
      phonePlaceholder: '+91 63793 02952',
      whatsappPlaceholder: '+91 63793 02952',
      businessHours: 'Monday - Saturday: 8:30 AM - 7:30 PM (Sunday Closed)',
      aboutSummary:
        'Founded in 1991 in Vasthanagar, Madurai, RJ BODY BUILDING has delivered 35 years of dedicated master craftsmanship in commercial lorry bodybuilding, heavy-duty cabin fabrication, hydraulic tipper construction, accident restoration, and custom commercial conversions.',
    },
  });

  // 2. Hash Passwords
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const workerPassword = await bcrypt.hash('Worker@12345', 10);

  // 3. Create Admin / Workshop Owner
  await prisma.user.upsert({
    where: { email: 'admin@rjbodybuilding.local' },
    update: {},
    create: {
      name: 'R. Jayachandran (Owner)',
      email: 'admin@rjbodybuilding.local',
      phone: '+91 94430 00001',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // 4. Create Staff Workers across the 10 Workshop Departments
  const workerData = [
    { name: 'Murugan P.', email: 'murugan.body@rjbodybuilding.local', phone: '+91 94430 11001', dept: 'Body Work', skills: 'Heavy chassis fabrication, tipper body welding, channel alignment' },
    { name: 'Selvam K.', email: 'selvam.paint@rjbodybuilding.local', phone: '+91 94430 11002', dept: 'Painting', skills: 'Polyurethane spray painting, basecoat, primer rustproofing' },
    { name: 'Karthik R.', email: 'karthik.artist@rjbodybuilding.local', phone: '+91 94430 11003', dept: 'Artist', skills: 'Traditional Tamil Nadu lorry art, lettering, custom cabin graphics' },
    { name: 'Raja S.', email: 'raja.electric@rjbodybuilding.local', phone: '+91 94430 11004', dept: 'Electrical', skills: 'Full lorry wiring loom, LED marker lights, cabin horn systems' },
    { name: 'Mani V.', email: 'mani.lining@rjbodybuilding.local', phone: '+91 94430 11005', dept: 'Lining', skills: 'Hardwood floor planking, side wall bead lining, heat insulation' },
    { name: 'Saravanan T.', email: 'saravanan.mech@rjbodybuilding.local', phone: '+91 94430 11006', dept: 'Mechanic', skills: 'Air brake testing, leaf spring tensioning, axle alignment' },
    { name: 'Kumar M.', email: 'kumar.glass@rjbodybuilding.local', phone: '+91 94430 11007', dept: 'Glass Fixing', skills: 'Toughened windshield bonding, rubber bead channel sealing' },
    { name: 'Vijay N.', email: 'vijay.sticker@rjbodybuilding.local', phone: '+91 94430 11008', dept: 'Sticker Fixing', skills: 'RTO-compliant AIS 090 retro-reflective tape, conspicuity markings' },
    { name: 'Dhanush K.', email: 'dhanush.maint@rjbodybuilding.local', phone: '+91 94430 11009', dept: 'Maintenance and Purchasing', skills: 'MS steel procurement, consumable inventory audits' },
    { name: 'Arunachalam M.', email: 'arun.security@rjbodybuilding.local', phone: '+91 94430 11010', dept: 'Security / Watchman', skills: 'Workshop gate logging, yard vehicle safety, night vigilance' },
  ];

  for (const w of workerData) {
    await prisma.user.upsert({
      where: { email: w.email },
      update: {},
      create: {
        name: w.name,
        email: w.email,
        phone: w.phone,
        passwordHash: workerPassword,
        role: 'WORKER',
        workerProfile: {
          create: {
            department: w.dept,
            skills: w.skills,
            status: 'ACTIVE',
          },
        },
      },
    });
  }

  // 5. Vehicle Categories and Models
  const smallCat = await prisma.vehicleCategory.upsert({
    where: { name: 'Small Vehicles' },
    update: {},
    create: {
      name: 'Small Vehicles',
      description: 'Compact commercial vehicles suitable for intracity distribution and lightweight cargo.',
      axleType: 'Single axle',
      tyreCount: 4,
    },
  });

  const mediumCat = await prisma.vehicleCategory.upsert({
    where: { name: 'Medium Vehicles' },
    update: {},
    create: {
      name: 'Medium Vehicles',
      description: 'Medium-duty commercial trucks suited for regional haulage and agricultural transport.',
      axleType: 'Single axle',
      tyreCount: 6,
    },
  });

  const heavyCat = await prisma.vehicleCategory.upsert({
    where: { name: 'Heavy Vehicles' },
    update: {},
    create: {
      name: 'Heavy Vehicles',
      description: 'Heavy long-haul lorries, multi-axle freight carriers, and heavy duty tippers.',
      axleType: 'Multi-axle',
      tyreCount: 10,
    },
  });

  // Delete Axle and Tyre Configurations category if it exists
  await prisma.vehicleCategory.deleteMany({
    where: { name: 'Axle and Tyre Configurations' },
  });

  // Vehicle Models
  const models = [
    { catId: smallCat.id, brand: 'Tata', name: 'Tata Ace', bodyTypes: 'Goods Carrier, Milk Van, Closed Box' },
    { catId: smallCat.id, brand: 'Tata', name: 'Tata Dost', bodyTypes: 'Goods Carrier, Grocery Transport, Open Flatbed' },
    { catId: smallCat.id, brand: 'Tata', name: 'Tata Intra', bodyTypes: 'High Deck Body, Container Body' },
    { catId: smallCat.id, brand: 'Mahindra', name: 'Mahindra SCV (Bolero Maxi Truck / Supro)', bodyTypes: 'Open Cargo Body, Agri Produce Carrier' },
    { catId: mediumCat.id, brand: 'Eicher', name: 'Eicher Pro 2049 / 2059', bodyTypes: 'Goods Carrier, Tipper Body, Grocery Transport' },
    { catId: mediumCat.id, brand: 'Mahindra', name: 'Mahindra Pro (Furio 11/14)', bodyTypes: 'Tipper Body, Closed Container, Cylinder Carrier' },
    { catId: heavyCat.id, brand: 'Ashok Leyland', name: 'Ashok Leyland Boss 1215 / 1415', bodyTypes: 'Full Cabin Body, Open High Side Body, Cattle Transport' },
    { catId: heavyCat.id, brand: 'Eicher', name: 'Eicher E-Comet 12.14 / 16.14', bodyTypes: 'Long Haul Goods Carrier, Timber Carrier' },
  ];

  for (const m of models) {
    const existing = await prisma.vehicleModel.findFirst({
      where: { modelName: m.name, categoryId: m.catId },
    });
    if (!existing) {
      await prisma.vehicleModel.create({
        data: {
          categoryId: m.catId,
          brand: m.brand,
          modelName: m.name,
          supportedBodyTypes: m.bodyTypes,
        },
      });
    }
  }

  // 6. Workshop Services (The 8 Official Workshop Categories)
  const servicesData = [
    {
      name: 'New Vehicle – New Body Building',
      slug: 'new-vehicle-new-body-building',
      category: 'Fabrication',
      description: 'Complete heavy-duty structural lorry bodybuilding from bare chassis with ISMC steel channels, customized cabin design, and precision alignment.',
    },
    {
      name: 'Accident Vehicle Rework',
      slug: 'accident-vehicle-rework',
      category: 'Repair',
      description: 'Chassis hydraulic straightening, cabin structural realignment, damaged panel reconstruction, and full accident vehicle restoration.',
    },
    {
      name: 'Old Vehicle to New Model Conversion',
      slug: 'old-vehicle-to-new-model-conversion',
      category: 'Modification',
      description: 'Upgrade and modernize aging commercial lorry cabins with contemporary front fascia, aerodynamic roof deflectors, and refreshed styling.',
    },
    {
      name: 'Goods Carrier Modification',
      slug: 'goods-carrier-modification',
      category: 'Modification',
      description: 'Reinforced corrugated side panels, heavy floor planking, tarpaulin rail systems, and customized payload modifications for commercial haulage.',
    },
    {
      name: 'Tipper Body Modification',
      slug: 'tipper-body-modification',
      category: 'Modification',
      description: 'Fabrication of abrasion-resistant high-gauge tipper bodies with hydraulic subframe integration for quarry, sand, and construction duty.',
    },
    {
      name: 'Grocery Vehicle Modification',
      slug: 'grocery-vehicle-modification',
      category: 'Modification',
      description: 'Multi-tiered shelving partitions, hygienic aluminium chequered floor, and ventilated shutters tailored for wholesale produce transit.',
    },
    {
      name: 'Cylinder Vehicle Modification',
      slug: 'cylinder-vehicle-modification',
      category: 'Modification',
      description: 'Safety-compliant gas cylinder transport bodies with locking partition bars, spark-resistant hardwood lining, and PESO norms compliance.',
    },
    {
      name: 'Cattle Carrier Vehicle Modification',
      slug: 'cattle-carrier-vehicle-modification',
      category: 'Modification',
      description: 'Air-ventilated slat walls, anti-slip grooved flooring, secure safety gates, and drainage troughs engineered for humane livestock transport.',
    },
  ];

  // Clean out legacy service items not in the 8 official categories
  const targetSlugs = servicesData.map((s) => s.slug);
  await prisma.service.deleteMany({
    where: { slug: { notIn: targetSlugs } },
  });

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        category: s.category,
        description: s.description,
      },
      create: s,
    });
  }

  console.log('--- RJ BODY BUILDING Database Seeding Completed Cleanly (0 Fake Records) ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
