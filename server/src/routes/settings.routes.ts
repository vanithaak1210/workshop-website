import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. Get Workshop Information & Editable Settings (Public)
router.get('/workshop', async (req, res) => {
  try {
    let settings = await prisma.workshopSetting.findUnique({
      where: { id: 'default-setting' },
    });

    if (!settings) {
      settings = await prisma.workshopSetting.create({
        data: {
          id: 'default-setting',
          workshopName: 'RJ BODY BUILDING',
          tagline: 'Lorry Body Building & Modification Workshop',
          location: 'Vasthanagar, near Agrini / Ravithurayan Temple, Madurai, Tamil Nadu, India',
          experienceYears: 35,
          establishedYear: 1991,
          phonePlaceholder: '+91 63793 02952',
          whatsappPlaceholder: '+91 63793 02952',
          businessHours: 'Monday - Saturday: 8:30 AM - 7:30 PM (Sunday Closed)',
        },
      });
    }

    return res.json({ settings });
  } catch (err: any) {
    console.error('Get settings error:', err);
    return res.status(500).json({ message: 'Failed to retrieve workshop settings.' });
  }
});

// 2. Update Workshop Settings (Admin Only)
router.put('/workshop', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      workshopName,
      tagline,
      location,
      phonePlaceholder,
      whatsappPlaceholder,
      businessHours,
      aboutSummary,
    } = req.body;

    const settings = await prisma.workshopSetting.upsert({
      where: { id: 'default-setting' },
      update: {
        workshopName: workshopName?.trim(),
        tagline: tagline?.trim(),
        location: location?.trim(),
        phonePlaceholder: phonePlaceholder?.trim(),
        whatsappPlaceholder: whatsappPlaceholder?.trim(),
        businessHours: businessHours?.trim(),
        aboutSummary: aboutSummary?.trim(),
      },
      create: {
        id: 'default-setting',
        workshopName: workshopName || 'RJ BODY BUILDING',
        tagline: tagline || 'Lorry Body Building & Modification Workshop',
        location: location || 'Vasthanagar, near Agrini / Ravithurayan Temple, Madurai, Tamil Nadu, India',
        phonePlaceholder: phonePlaceholder || '+91 63793 02952',
        whatsappPlaceholder: whatsappPlaceholder || '+91 63793 02952',
        businessHours: businessHours || 'Monday - Saturday: 8:30 AM - 7:30 PM',
        aboutSummary: aboutSummary || '35 years of lorry bodybuilding excellence.',
      },
    });

    return res.json({ message: 'Workshop settings updated successfully.', settings });
  } catch (err: any) {
    console.error('Update settings error:', err);
    return res.status(500).json({ message: 'Failed to update workshop settings.' });
  }
});

// 3. Get Vehicle Categories and Models (Public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.vehicleCategory.findMany({
      include: {
        models: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.json({ categories });
  } catch (err: any) {
    console.error('Get categories error:', err);
    return res.status(500).json({ message: 'Failed to retrieve vehicle categories.' });
  }
});

// 4. Add/Update Vehicle Category / Model (Admin Only)
router.post('/categories', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, axleType, tyreCount } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const category = await prisma.vehicleCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        axleType: axleType?.trim() || null,
        tyreCount: tyreCount ? Number(tyreCount) : null,
      },
    });

    return res.status(201).json({ message: 'Category created.', category });
  } catch (err: any) {
    console.error('Create category error:', err);
    return res.status(500).json({ message: 'Failed to create category.' });
  }
});

router.post('/models', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { categoryId, brand, modelName, supportedBodyTypes } = req.body;

    if (!categoryId || !brand?.trim() || !modelName?.trim()) {
      return res.status(400).json({ message: 'Category ID, brand, and model name are required.' });
    }

    const model = await prisma.vehicleModel.create({
      data: {
        categoryId,
        brand: brand.trim(),
        modelName: modelName.trim(),
        supportedBodyTypes: supportedBodyTypes?.trim() || 'General Goods Carrier',
      },
    });

    return res.status(201).json({ message: 'Model created.', model });
  } catch (err: any) {
    console.error('Create model error:', err);
    return res.status(500).json({ message: 'Failed to create model.' });
  }
});

// 5. Get Services (Public)
router.get('/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return res.json({ services });
  } catch (err: any) {
    console.error('Get services error:', err);
    return res.status(500).json({ message: 'Failed to retrieve services.' });
  }
});

// 6. Manage Services (Admin Only)
router.post('/services', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, category, description } = req.body;

    if (!name?.trim() || !slug?.trim() || !category) {
      return res.status(400).json({ message: 'Name, slug, and category are required.' });
    }

    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        category,
        description: description?.trim() || '',
        isActive: true,
      },
    });

    return res.status(201).json({ message: 'Service added successfully.', service });
  } catch (err: any) {
    console.error('Create service error:', err);
    return res.status(500).json({ message: 'Failed to create service.' });
  }
});

// 7. Update Service (Admin Only)
router.put('/services/:id', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, category, description, isActive } = req.body;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        category: category !== undefined ? category.trim() : existing.category,
        description: description !== undefined ? description.trim() : existing.description,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    return res.json({ message: 'Service category updated successfully.', service: updated });
  } catch (err: any) {
    console.error('Update service error:', err);
    return res.status(500).json({ message: 'Failed to update service.' });
  }
});

export default router;
