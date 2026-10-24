import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. Submit Contact Message (Public)
router.post('/', async (req, res) => {
  try {
    const { name, phone, subject, message } = req.body;

    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Name, phone number, and message are required.' });
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        subject: subject ? subject.trim() : 'General Workshop Enquiry',
        message: message.trim(),
        status: 'NEW',
      },
    });

    return res.status(201).json({
      message: 'Thank you for reaching out to RJ BODY BUILDING. We have received your message.',
      contactId: contact.id,
    });
  } catch (err: any) {
    console.error('Contact submit error:', err);
    return res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

// 2. List Contact Messages (Admin Only)
router.get('/', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ messages });
  } catch (err: any) {
    console.error('List contacts error:', err);
    return res.status(500).json({ message: 'Failed to retrieve contact messages.' });
  }
});

// 3. Update Message Status (Admin Only)
router.patch('/:id/status', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const validStatuses = ['NEW', 'READ', 'RESPONDED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    return res.json({ message: 'Status updated.', messageItem: updated });
  } catch (err: any) {
    console.error('Update contact status error:', err);
    return res.status(500).json({ message: 'Failed to update contact message status.' });
  }
});

export default router;
