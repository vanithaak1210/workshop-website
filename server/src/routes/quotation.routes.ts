import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Generate unique quotation number
async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.quotation.count();
  let ref = `QUO-${year}-${String(count + 1).padStart(4, '0')}`;
  let exists = await prisma.quotation.findUnique({ where: { quoteNumber: ref } });
  let offset = 1;
  while (exists) {
    ref = `QUO-${year}-${String(count + 1 + offset).padStart(4, '0')}`;
    exists = await prisma.quotation.findUnique({ where: { quoteNumber: ref } });
    offset++;
  }
  return ref;
}

// 1. Create Quotation (Admin Only)
router.post('/', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      enquiryId,
      customerId,
      items,
      discount = 0,
      taxOrCharges = 0,
      notes,
      validityDate,
      estimatedCompletionDate,
      publishImmediately = false,
    } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Quotation must have at least one line item.' });
    }

    // Verify customer exists
    const customer = await prisma.user.findUnique({ where: { id: String(customerId) } });
    if (!customer) {
      return res.status(404).json({ message: 'Selected customer account does not exist.' });
    }

    // Calculate line items and subtotal
    let subtotal = 0;
    const validatedItems = items.map((item: any) => {
      const quantity = Math.max(0.1, Number(item.quantity) || 1);
      const unitRate = Math.max(0, Number(item.unitRate) || 0);
      const amount = quantity * unitRate;
      subtotal += amount;
      return {
        description: item.description?.trim() || 'Work item',
        quantity,
        unit: item.unit?.trim() || 'Nos',
        unitRate,
        amount,
      };
    });

    const parsedDiscount = Math.max(0, Number(discount) || 0);
    const parsedCharges = Math.max(0, Number(taxOrCharges) || 0);
    const totalAmount = Math.max(0, subtotal - parsedDiscount + parsedCharges);

    const quoteNumber = await generateQuoteNumber();

    const quotation = await prisma.quotation.create({
      data: {
        quoteNumber,
        enquiryId: enquiryId ? String(enquiryId) : null,
        customerId: String(customerId),
        subtotal,
        discount: parsedDiscount,
        taxOrCharges: parsedCharges,
        totalAmount,
        notes: notes ? notes.trim() : null,
        validityDate: validityDate ? new Date(validityDate) : null,
        estimatedCompletionDate: estimatedCompletionDate ? new Date(estimatedCompletionDate) : null,
        status: publishImmediately ? 'SENT' : 'DRAFT',
        items: {
          create: validatedItems,
        },
      },
      include: {
        items: true,
        customer: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    // If quotation was generated from an enquiry, update enquiry status to QUOTED
    if (enquiryId) {
      await prisma.enquiry.update({
        where: { id: String(enquiryId) },
        data: { status: 'QUOTED' },
      });
    }

    return res.status(201).json({
      message: `Quotation ${quotation.quoteNumber} created successfully.`,
      quotation,
    });
  } catch (err: any) {
    console.error('Create quotation error:', err);
    return res.status(500).json({ message: 'Failed to create quotation.' });
  }
});

// 2. List Quotations (Admin sees all, Customer sees own)
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.query;

    if (req.user?.role === 'ADMIN') {
      const where: any = {};
      if (status && status !== 'ALL') {
        where.status = String(status);
      }

      const quotations = await prisma.quotation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true, email: true } },
          enquiry: { select: { id: true, enquiryNumber: true, vehicleMakeModel: true } },
          items: true,
          job: { select: { id: true, jobNumber: true, currentStage: true, status: true } },
        },
      });

      return res.json({ quotations });
    } else if (req.user?.role === 'CUSTOMER') {
      const quotations = await prisma.quotation.findMany({
        where: { customerId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          enquiry: { select: { id: true, enquiryNumber: true, vehicleMakeModel: true } },
          items: true,
          job: { select: { id: true, jobNumber: true, currentStage: true, status: true } },
        },
      });

      return res.json({ quotations });
    } else {
      return res.status(403).json({ message: 'Workers cannot access quotations.' });
    }
  } catch (err: any) {
    console.error('List quotations error:', err);
    return res.status(500).json({ message: 'Failed to retrieve quotations.' });
  }
});

// 3. Get Single Quotation
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        enquiry: true,
        items: true,
        job: true,
      },
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    if (req.user?.role === 'CUSTOMER' && quotation.customerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to this quotation.' });
    }

    return res.json({ quotation });
  } catch (err: any) {
    console.error('Get quotation error:', err);
    return res.status(500).json({ message: 'Failed to retrieve quotation details.' });
  }
});

// 4. Update Quotation (Admin Only)
router.put('/:id', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { items, discount = 0, taxOrCharges = 0, notes, validityDate, estimatedCompletionDate, status } = req.body;

    const existing = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    if (existing.status === 'APPROVED') {
      return res.status(400).json({ message: 'Approved quotations cannot be modified.' });
    }

    let subtotal = 0;
    const validatedItems = items?.map((item: any) => {
      const quantity = Math.max(0.1, Number(item.quantity) || 1);
      const unitRate = Math.max(0, Number(item.unitRate) || 0);
      const amount = quantity * unitRate;
      subtotal += amount;
      return {
        description: item.description?.trim() || 'Item',
        quantity,
        unit: item.unit?.trim() || 'Nos',
        unitRate,
        amount,
      };
    });

    const parsedDiscount = Math.max(0, Number(discount) || 0);
    const parsedCharges = Math.max(0, Number(taxOrCharges) || 0);
    const totalAmount = Math.max(0, subtotal - parsedDiscount + parsedCharges);

    // Delete old items and insert updated ones
    await prisma.quotationItem.deleteMany({ where: { quotationId: id } });

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        subtotal,
        discount: parsedDiscount,
        taxOrCharges: parsedCharges,
        totalAmount,
        notes: notes ? notes.trim() : null,
        validityDate: validityDate ? new Date(validityDate) : null,
        estimatedCompletionDate: estimatedCompletionDate ? new Date(estimatedCompletionDate) : null,
        status: status || existing.status,
        items: {
          create: validatedItems,
        },
      },
      include: { items: true },
    });

    return res.json({ message: 'Quotation updated successfully.', quotation: updated });
  } catch (err: any) {
    console.error('Update quotation error:', err);
    return res.status(500).json({ message: 'Failed to update quotation.' });
  }
});

// 5. Customer Approve Quotation
router.post('/:id/approve', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const quotation = await prisma.quotation.findUnique({
      where: { id },
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    // Role check: Only customer owner or Admin can approve
    if (req.user?.role === 'CUSTOMER' && quotation.customerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to approve this quotation.' });
    }

    if (quotation.status === 'APPROVED') {
      return res.status(400).json({ message: 'This quotation is already approved.' });
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    return res.json({
      message: 'Quotation approved successfully. Workshop team will prepare job activation.',
      quotation: updated,
    });
  } catch (err: any) {
    console.error('Approve quotation error:', err);
    return res.status(500).json({ message: 'Failed to record quotation approval.' });
  }
});

// 6. Customer Reject Quotation
router.post('/:id/reject', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { rejectionReason } = req.body;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    if (req.user?.role === 'CUSTOMER' && quotation.customerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to reject this quotation.' });
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: rejectionReason ? rejectionReason.trim() : 'Customer requested revision or rejected estimate.',
      },
    });

    return res.json({
      message: 'Quotation rejection recorded.',
      quotation: updated,
    });
  } catch (err: any) {
    console.error('Reject quotation error:', err);
    return res.status(500).json({ message: 'Failed to record quotation rejection.' });
  }
});

export default router;
