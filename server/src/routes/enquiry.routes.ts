import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, optionalAuthenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Helper to generate unique booking / enquiry number
async function generateReferenceNumber(isBooking: boolean): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = isBooking ? 'BK' : 'ENQ';
  const count = await prisma.enquiry.count();
  const sequence = String(count + 1).padStart(4, '0');
  let ref = `${prefix}-${year}-${sequence}`;
  
  // ensure uniqueness
  let exists = await prisma.enquiry.findUnique({ where: { enquiryNumber: ref } });
  let offset = 1;
  while (exists) {
    ref = `${prefix}-${year}-${String(count + 1 + offset).padStart(4, '0')}`;
    exists = await prisma.enquiry.findUnique({ where: { enquiryNumber: ref } });
    offset++;
  }
  return ref;
}

// 1. Submit Service Booking or General Enquiry (100% Public or Authenticated Customer)
router.post('/', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      vehicleCategory,
      vehicleMakeModel,
      vehiclePurpose,
      enquiryType,
      selectedService,
      preferredDate,
      preferredTime,
      serviceLocation,
      requestedServices,
      notes,
      message,
      photoUrl,
    } = req.body;

    // Validation
    if (!customerName?.trim() || !customerPhone?.trim()) {
      return res.status(400).json({ message: 'Customer name and phone number are required.' });
    }

    const cleanPhone = customerPhone.trim();
    if (cleanPhone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ message: 'Please enter a valid phone number (at least 10 digits).' });
    }

    const isBooking =
      enquiryType === 'SERVICE_BOOKING' ||
      Boolean(preferredDate) ||
      Boolean(serviceLocation) ||
      (req.body.actionType === 'BOOK_SERVICE');

    const resolvedType = isBooking
      ? 'SERVICE_BOOKING'
      : (enquiryType?.trim() || 'GENERAL_ENQUIRY');

    // Tyre category check
    if (vehicleCategory && vehicleCategory.toLowerCase().includes('tyre')) {
      return res.status(400).json({
        message: 'The Tyre category is no longer available. Please select Small Vehicles, Medium Vehicles, or Heavy Vehicles.',
      });
    }

    const resolvedCategory = vehicleCategory?.trim() || (isBooking ? 'Heavy Vehicles' : 'General');
    const resolvedMakeModel = vehicleMakeModel?.trim() || (isBooking ? 'Vehicle Model' : 'General Service');
    const resolvedPurpose = vehiclePurpose?.trim() || (isBooking ? (selectedService || 'Commercial Service Booking') : 'General Enquiry');
    const resolvedNotes = notes?.trim() || message?.trim() || null;

    // Check duplicate submission in the last 30 seconds from same phone
    const thirtySecAgo = new Date(Date.now() - 30000);
    const recentDuplicate = await prisma.enquiry.findFirst({
      where: {
        customerPhone: cleanPhone,
        createdAt: { gte: thirtySecAgo },
      },
    });

    if (recentDuplicate) {
      return res.status(429).json({
        message: 'A similar submission was just received. Please check your reference number.',
        enquiryNumber: recentDuplicate.enquiryNumber,
      });
    }

    const enquiryNumber = await generateReferenceNumber(isBooking);

    let parsedServices: string[] = [];
    if (Array.isArray(requestedServices)) {
      parsedServices = requestedServices;
    } else if (selectedService) {
      parsedServices = [selectedService];
    }
    const servicesJson = JSON.stringify(parsedServices);

    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber,
        customerId: req.user ? req.user.id : null,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        vehicleCategory: resolvedCategory,
        vehicleMakeModel: resolvedMakeModel,
        vehiclePurpose: resolvedPurpose,
        enquiryType: resolvedType,
        selectedService: selectedService ? selectedService.trim() : null,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime ? preferredTime.trim() : null,
        serviceLocation: serviceLocation ? serviceLocation.trim() : null,
        requestedServices: servicesJson,
        notes: resolvedNotes,
        photoUrl: photoUrl || null,
        status: 'NEW',
      },
    });

    const successMessage = isBooking
      ? `Service booking submitted successfully! Reference: ${enquiryNumber}`
      : `Enquiry submitted successfully! Reference: ${enquiryNumber}`;

    return res.status(201).json({
      message: successMessage,
      enquiry: {
        id: enquiry.id,
        enquiryNumber: enquiry.enquiryNumber,
        customerName: enquiry.customerName,
        customerPhone: enquiry.customerPhone,
        selectedService: enquiry.selectedService,
        vehicleCategory: enquiry.vehicleCategory,
        vehicleMakeModel: enquiry.vehicleMakeModel,
        preferredDate: enquiry.preferredDate,
        preferredTime: enquiry.preferredTime,
        serviceLocation: enquiry.serviceLocation,
        enquiryType: enquiry.enquiryType,
        status: enquiry.status,
        createdAt: enquiry.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Submit enquiry error:', err);
    return res.status(500).json({ message: 'Failed to submit enquiry. Please check your details and try again.' });
  }
});

// 2. List Enquiries & Bookings (Admin gets all with filters, Customer gets own)
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search, type } = req.query;

    if (req.user?.role === 'ADMIN') {
      const where: any = {};
      if (status && status !== 'ALL') {
        where.status = String(status);
      }
      if (type && type !== 'ALL') {
        where.enquiryType = String(type);
      }
      if (search) {
        const query = String(search).toLowerCase();
        where.OR = [
          { enquiryNumber: { contains: query } },
          { customerName: { contains: query } },
          { customerPhone: { contains: query } },
          { vehicleMakeModel: { contains: query } },
          { selectedService: { contains: query } },
        ];
      }

      const enquiries = await prisma.enquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          quotations: { select: { id: true, quoteNumber: true, totalAmount: true, status: true } },
        },
      });

      return res.json({ enquiries });
    } else if (req.user?.role === 'CUSTOMER') {
      // Find enquiries belonging strictly to the customer account or customer's phone
      const customerConditions: any[] = [{ customerId: req.user.id }];
      if (req.user.phone) {
        customerConditions.push({ customerPhone: req.user.phone });
      }

      const enquiries = await prisma.enquiry.findMany({
        where: {
          OR: customerConditions,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          quotations: { select: { id: true, quoteNumber: true, totalAmount: true, status: true } },
        },
      });

      return res.json({ enquiries });
    } else {
      return res.status(403).json({ message: 'Workers cannot access general customer enquiries.' });
    }
  } catch (err: any) {
    console.error('List enquiries error:', err);
    return res.status(500).json({ message: 'Failed to retrieve enquiries.' });
  }
});

// 3. Get Single Enquiry
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        quotations: {
          include: { items: true },
        },
        jobs: true,
      },
    });

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    if (req.user?.role === 'CUSTOMER') {
      const isOwner = enquiry.customerId === req.user.id || (req.user.phone && enquiry.customerPhone === req.user.phone);
      if (!isOwner) {
        return res.status(403).json({ message: 'You do not have permission to view this enquiry.' });
      }
      if (!enquiry.customerId) {
        // Auto-link customer ID if submitted before registration
        await prisma.enquiry.update({ where: { id: enquiry.id }, data: { customerId: req.user.id } });
      }
    }

    return res.json({ enquiry });
  } catch (err: any) {
    console.error('Get enquiry error:', err);
    return res.status(500).json({ message: 'Failed to retrieve enquiry.' });
  }
});

// 4. Update Booking Details (Admin Only - Edit Booking Feature)
router.put('/:id', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      customerName,
      customerPhone,
      vehicleCategory,
      vehicleMakeModel,
      selectedService,
      preferredDate,
      preferredTime,
      serviceLocation,
      status,
      notes,
    } = req.body;

    const existing = await prisma.enquiry.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Service booking record not found.' });
    }

    if (!customerName?.trim() || !customerPhone?.trim()) {
      return res.status(400).json({ message: 'Customer name and phone number are required.' });
    }

    const cleanPhone = customerPhone.trim();
    if (cleanPhone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit phone number.' });
    }

    // Supported statuses: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    const validStatuses = [
      'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
      'NEW', 'IN_REVIEW', 'QUOTED', 'CONVERTED', 'REJECTED',
    ];

    let resolvedStatus = existing.status;
    if (status) {
      const normalized = status.trim().toUpperCase().replace(/\s+/g, '_');
      if (validStatuses.includes(normalized)) {
        resolvedStatus = normalized;
      }
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        vehicleCategory: vehicleCategory ? vehicleCategory.trim() : existing.vehicleCategory,
        vehicleMakeModel: vehicleMakeModel ? vehicleMakeModel.trim() : existing.vehicleMakeModel,
        selectedService: selectedService ? selectedService.trim() : existing.selectedService,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime ? preferredTime.trim() : null,
        serviceLocation: serviceLocation ? serviceLocation.trim() : null,
        status: resolvedStatus,
        notes: notes !== undefined ? (notes ? notes.trim() : null) : existing.notes,
      },
    });

    return res.json({ message: 'Booking details updated successfully.', booking: updated });
  } catch (err: any) {
    console.error('Update booking error:', err);
    return res.status(500).json({ message: 'Failed to update booking record. Please try again.' });
  }
});

// 5. Update Status (Admin Only)
router.patch('/:id/status', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const validStatuses = [
      'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
      'NEW', 'IN_REVIEW', 'QUOTED', 'CONVERTED', 'REJECTED',
    ];

    const normalized = String(status || '').trim().toUpperCase().replace(/\s+/g, '_');

    if (!validStatuses.includes(normalized)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: Pending, Confirmed, In Progress, Completed, Cancelled` });
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: { status: normalized },
    });

    return res.json({ message: 'Booking status updated successfully.', enquiry: updated });
  } catch (err: any) {
    console.error('Update enquiry status error:', err);
    return res.status(500).json({ message: 'Failed to update booking status.' });
  }
});

export default router;
