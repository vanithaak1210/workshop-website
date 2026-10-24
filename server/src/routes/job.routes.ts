import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

export const WORKSHOP_STAGES = [
  'ENQUIRY_RECEIVED',
  'QUOTATION_APPROVED',
  'BODY_BUILDING_REPAIR',
  'PAINTING_FINISHING',
  'QUALITY_CHECK',
  'BILLING_DELIVERY',
];

async function generateJobNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.job.count();
  let ref = `JOB-${year}-${String(count + 1).padStart(4, '0')}`;
  let exists = await prisma.job.findUnique({ where: { jobNumber: ref } });
  let offset = 1;
  while (exists) {
    ref = `JOB-${year}-${String(count + 1 + offset).padStart(4, '0')}`;
    exists = await prisma.job.findUnique({ where: { jobNumber: ref } });
    offset++;
  }
  return ref;
}

// 1. Activate Job from Approved Quotation (Admin Only)
router.post('/activate', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { quotationId, vehicleDetails, expectedDeliveryDate } = req.body;

    if (!quotationId || !vehicleDetails?.trim()) {
      return res.status(400).json({ message: 'Quotation ID and vehicle details are required to activate a job.' });
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id: String(quotationId) },
      include: { enquiry: true, job: true },
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    if (quotation.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Only approved quotations can be activated into active workshop jobs.' });
    }

    if (quotation.job) {
      return res.status(400).json({ message: `Job ${quotation.job.jobNumber} has already been activated for this quotation.` });
    }

    const jobNumber = await generateJobNumber();

    const job = await prisma.job.create({
      data: {
        jobNumber,
        quotationId: quotation.id,
        enquiryId: quotation.enquiryId,
        customerId: quotation.customerId,
        vehicleDetails: vehicleDetails.trim(),
        currentStage: 'QUOTATION_APPROVED',
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : quotation.estimatedCompletionDate,
        status: 'IN_PROGRESS',
        stageHistory: {
          create: [
            {
              stage: 'ENQUIRY_RECEIVED',
              status: 'COMPLETED',
              notes: 'Enquiry received and requirements captured.',
              updatedById: req.user!.id,
            },
            {
              stage: 'QUOTATION_APPROVED',
              status: 'CURRENT',
              notes: `Quotation ${quotation.quoteNumber} approved. Job formally activated by workshop administration.`,
              updatedById: req.user!.id,
            },
          ],
        },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        stageHistory: true,
      },
    });

    // Mark enquiry converted if present
    if (quotation.enquiryId) {
      await prisma.enquiry.update({
        where: { id: quotation.enquiryId },
        data: { status: 'CONVERTED' },
      });
    }

    return res.status(201).json({
      message: `Job ${job.jobNumber} activated successfully.`,
      job,
    });
  } catch (err: any) {
    console.error('Activate job error:', err);
    return res.status(500).json({ message: 'Failed to activate workshop job.' });
  }
});

// 2. List Jobs (Role-based)
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, stage } = req.query;

    if (req.user?.role === 'ADMIN') {
      const where: any = {};
      if (status && status !== 'ALL') where.status = String(status);
      if (stage && stage !== 'ALL') where.currentStage = String(stage);

      const jobs = await prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          quotation: { select: { id: true, quoteNumber: true, totalAmount: true } },
          tasks: {
            include: { assignedWorker: { select: { id: true, name: true } } },
          },
        },
      });

      return res.json({ jobs });
    } else if (req.user?.role === 'CUSTOMER') {
      const jobs = await prisma.job.findMany({
        where: { customerId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          stageHistory: { orderBy: { createdAt: 'asc' } },
          quotation: { select: { id: true, quoteNumber: true, totalAmount: true } },
        },
      });

      return res.json({ jobs });
    } else if (req.user?.role === 'WORKER') {
      // Return jobs where worker has assigned tasks
      const jobs = await prisma.job.findMany({
        where: {
          tasks: {
            some: { assignedWorkerId: req.user.id },
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          tasks: {
            where: { assignedWorkerId: req.user.id },
          },
          stageHistory: { orderBy: { createdAt: 'asc' } },
        },
      });

      return res.json({ jobs });
    }
  } catch (err: any) {
    console.error('List jobs error:', err);
    return res.status(500).json({ message: 'Failed to retrieve jobs.' });
  }
});

// 3. Get Single Job (With visual timeline stages and history)
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobId = String(req.params.id);
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        quotation: {
          include: { items: true },
        },
        enquiry: true,
        stageHistory: {
          orderBy: { createdAt: 'asc' },
          include: { updater: { select: { id: true, name: true, role: true } } },
        },
        tasks: {
          include: { assignedWorker: { select: { id: true, name: true } } },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ message: 'Workshop job not found.' });
    }

    if (req.user?.role === 'CUSTOMER' && job.customerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to view this job.' });
    }

    // Filter out financial info for workers
    if (req.user?.role === 'WORKER') {
      const { bills, quotation, ...workerJobView } = job as any;
      return res.json({ job: workerJobView });
    }

    return res.json({ job });
  } catch (err: any) {
    console.error('Get job error:', err);
    return res.status(500).json({ message: 'Failed to retrieve job details.' });
  }
});

// 4. Update Job Stage & Timeline (Admin Only)
router.patch('/:id/stage', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobId = String(req.params.id);
    const { newStage, notes, skipReason, isSkipped = false } = req.body;

    if (!WORKSHOP_STAGES.includes(newStage)) {
      return res.status(400).json({ message: `Invalid stage. Must be one of: ${WORKSHOP_STAGES.join(', ')}` });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Add stage history entry
    await prisma.jobStageHistory.create({
      data: {
        jobId: job.id,
        stage: newStage,
        status: isSkipped ? 'SKIPPED' : 'CURRENT',
        notes: notes ? notes.trim() : null,
        skipped: isSkipped,
        skipReason: isSkipped ? (skipReason?.trim() || 'Stage skipped by workshop supervisor.') : null,
        updatedById: req.user!.id,
      },
    });

    const updatedJob = await prisma.job.update({
      where: { id: job.id },
      data: {
        currentStage: newStage,
        status: newStage === 'BILLING_DELIVERY' ? 'COMPLETED' : 'IN_PROGRESS',
      },
      include: {
        stageHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    return res.json({
      message: `Job timeline stage updated to ${newStage.replace(/_/g, ' ')}.`,
      job: updatedJob,
    });
  } catch (err: any) {
    console.error('Update job stage error:', err);
    return res.status(500).json({ message: 'Failed to update job stage.' });
  }
});

// 5. Mark Job as Delivered (Admin Only)
router.post('/:id/deliver', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobId = String(req.params.id);
    const { notes } = req.body;
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const now = new Date();

    await prisma.jobStageHistory.create({
      data: {
        jobId: job.id,
        stage: 'BILLING_DELIVERY',
        status: 'COMPLETED',
        notes: notes?.trim() || 'Vehicle delivery gatepass issued and handed over to customer.',
        updatedById: req.user!.id,
      },
    });

    const updated = await prisma.job.update({
      where: { id: job.id },
      data: {
        currentStage: 'BILLING_DELIVERY',
        status: 'DELIVERED',
        actualDeliveryDate: now,
      },
    });

    return res.json({
      message: 'Vehicle marked as Delivered successfully.',
      job: updated,
    });
  } catch (err: any) {
    console.error('Deliver job error:', err);
    return res.status(500).json({ message: 'Failed to record vehicle delivery.' });
  }
});

// 6. Assign Task to Worker (Admin Only)
router.post('/:id/tasks', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobId = String(req.params.id);
    const { title, description, department, assignedWorkerId } = req.body;

    if (!title?.trim() || !department) {
      return res.status(400).json({ message: 'Task title and department are required.' });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const task = await prisma.jobTask.create({
      data: {
        jobId: job.id,
        title: title.trim(),
        description: description ? description.trim() : null,
        department,
        assignedWorkerId: assignedWorkerId ? String(assignedWorkerId) : null,
        status: 'PENDING',
      },
      include: {
        assignedWorker: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({
      message: 'Task assigned successfully.',
      task,
    });
  } catch (err: any) {
    console.error('Assign task error:', err);
    return res.status(500).json({ message: 'Failed to assign task.' });
  }
});

// 7. Update Task Status (Worker or Admin)
router.patch('/tasks/:taskId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = String(req.params.taskId);
    const { status, notes } = req.body;
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid task status. Must be PENDING, IN_PROGRESS, or COMPLETED.' });
    }

    const task = await prisma.jobTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Workers can only update their own assigned tasks
    if (req.user?.role === 'WORKER' && task.assignedWorkerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update tasks assigned to your profile.' });
    }

    const updatedTask = await prisma.jobTask.update({
      where: { id: taskId },
      data: {
        status,
        notes: notes !== undefined ? notes.trim() : task.notes,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
      include: {
        assignedWorker: { select: { id: true, name: true } },
      },
    });

    return res.json({
      message: 'Task status updated.',
      task: updatedTask,
    });
  } catch (err: any) {
    console.error('Update task error:', err);
    return res.status(500).json({ message: 'Failed to update task.' });
  }
});

export default router;
