import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

export const WORKSHOP_DEPARTMENTS = [
  'Body Work',
  'Painting',
  'Artist',
  'Electrical',
  'Lining',
  'Mechanic',
  'Glass Fixing',
  'Sticker Fixing',
  'Maintenance and Purchasing',
  'Security / Watchman',
];

// 1. List Workers (Admin Only)
router.get('/', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { department, status } = req.query;

    const where: any = { role: 'WORKER' };
    const profileWhere: any = {};

    if (department && department !== 'ALL') {
      profileWhere.department = String(department);
    }
    if (status && status !== 'ALL') {
      profileWhere.status = String(status);
    }

    if (Object.keys(profileWhere).length > 0) {
      where.workerProfile = profileWhere;
    }

    const workers = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        workerProfile: true,
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            job: { select: { id: true, jobNumber: true, vehicleDetails: true } },
          },
        },
      },
    });

    return res.json({ workers, departments: WORKSHOP_DEPARTMENTS });
  } catch (err: any) {
    console.error('List workers error:', err);
    return res.status(500).json({ message: 'Failed to retrieve workers list.' });
  }
});

// 2. Add New Worker (Admin Only)
router.post('/', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, password, department, skills } = req.body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password?.trim() || !department) {
      return res.status(400).json({ message: 'Name, email, phone, password, and department are required.' });
    }

    if (!WORKSHOP_DEPARTMENTS.includes(department)) {
      return res.status(400).json({ message: `Department must be one of: ${WORKSHOP_DEPARTMENTS.join(', ')}` });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'A user account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        passwordHash,
        role: 'WORKER',
        workerProfile: {
          create: {
            department,
            skills: skills ? skills.trim() : null,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        workerProfile: true,
      },
    });

    return res.status(201).json({
      message: `Worker ${user.name} added successfully in ${department}.`,
      worker: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        workerProfile: user.workerProfile,
      },
    });
  } catch (err: any) {
    console.error('Add worker error:', err);
    return res.status(500).json({ message: 'Failed to add worker.' });
  }
});

// 3. Update Worker Profile (Admin Only)
router.put('/:id', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, phone, department, skills, status, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { workerProfile: true },
    });

    if (!user || user.role !== 'WORKER') {
      return res.status(404).json({ message: 'Worker not found.' });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    if (password && password.trim().length >= 6) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    const profileData: any = {};
    if (department && WORKSHOP_DEPARTMENTS.includes(department)) profileData.department = department;
    if (skills !== undefined) profileData.skills = skills ? skills.trim() : null;
    if (status) profileData.status = status;

    const updatedProfile = await prisma.workerProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        userId: user.id,
        department: department || 'Body Work',
        skills: skills || null,
        status: status || 'ACTIVE',
      },
    });

    return res.json({
      message: 'Worker details updated successfully.',
      worker: {
        id: user.id,
        name: updateData.name || user.name,
        email: user.email,
        phone: updateData.phone || user.phone,
        workerProfile: updatedProfile,
      },
    });
  } catch (err: any) {
    console.error('Update worker error:', err);
    return res.status(500).json({ message: 'Failed to update worker.' });
  }
});

// 4. Worker Self Tasks
router.get('/my-tasks', authenticate, requireRole(['WORKER']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await prisma.jobTask.findMany({
      where: { assignedWorkerId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            jobNumber: true,
            vehicleDetails: true,
            currentStage: true,
            expectedDeliveryDate: true,
            status: true,
          },
        },
      },
    });

    return res.json({ tasks });
  } catch (err: any) {
    console.error('Get worker tasks error:', err);
    return res.status(500).json({ message: 'Failed to retrieve assigned tasks.' });
  }
});

export default router;
