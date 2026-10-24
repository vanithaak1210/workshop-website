import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'rj_body_building_secure_jwt_secret_vasthanagar_madurai_2026';

// Register (Public - Customers only)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields (name, email, phone, password) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Phone format basic check
    const cleanPhone = phone.trim();
    if (cleanPhone.length < 10) {
      return res.status(400).json({ message: 'Please provide a valid contact phone number.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: cleanPhone,
        passwordHash,
        role: 'CUSTOMER', // Strict: public cannot create ADMIN or WORKER accounts
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'An error occurred during registration. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { workerProfile: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. Please verify your email and password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Please verify your email and password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        workerProfile: user.workerProfile,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'An error occurred during login. Please try again.' });
  }
});

// Get Current User
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { workerProfile: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        workerProfile: user.workerProfile,
      },
    });
  } catch (err: any) {
    console.error('Get me error:', err);
    return res.status(500).json({ message: 'Failed to retrieve profile details.' });
  }
});

// Admin: Get all genuine registered customers
router.get('/customers', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            enquiries: true,
            quotations: true,
            jobs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ customers });
  } catch (err: any) {
    console.error('List customers error:', err);
    return res.status(500).json({ message: 'Failed to retrieve customers list.' });
  }
});

// Admin: Manually create a legitimate customer account (e.g. for walk-in client)
router.post('/customers', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({ message: 'Customer name and phone number are required.' });
    }

    const cleanEmail = email?.trim()
      ? email.toLowerCase().trim()
      : `customer-${Date.now()}@rjbodybuilding.local`;

    const cleanPhone = phone.trim();
    if (cleanPhone.length < 10) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit contact phone number.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'A customer account with this email already exists.' });
    }

    const initialPassword = password?.trim() || 'Customer@12345';
    const passwordHash = await bcrypt.hash(initialPassword, 10);

    const customer = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: 'Legitimate customer account registered successfully.',
      customer,
    });
  } catch (err: any) {
    console.error('Create customer error:', err);
    return res.status(500).json({ message: 'Failed to create customer record.' });
  }
});

export default router;

