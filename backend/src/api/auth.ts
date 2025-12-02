import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getPool } from '../database';
import { v4 as uuidv4 } from 'uuid';

export interface AuthRequest extends Request {
    adminId?: string;
    userId?: string;
    email?: string;
    role?: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { adminId?: string; userId?: string; email: string; role?: string };
        console.log('[AUTH DEBUG] Decoded token:', { adminId: decoded.adminId, userId: decoded.userId, role: decoded.role, email: decoded.email });
        
        if (decoded.adminId) {
            req.adminId = decoded.adminId;
            req.role = (decoded.role || 'ADMIN') as 'SUPER_ADMIN' | 'ADMIN';
        } else if (decoded.userId) {
            req.userId = decoded.userId;
            req.role = 'USER';
        } else if (decoded.role) {
            // Fallback: якщо роль є, але немає adminId/userId
            req.role = decoded.role as 'SUPER_ADMIN' | 'ADMIN' | 'USER';
        }
        req.email = decoded.email;
        
        console.log('[AUTH DEBUG] Request role set to:', req.role);
        next();
    } catch (error) {
        console.error('[AUTH DEBUG] Token verification error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role || (req.role !== 'ADMIN' && req.role !== 'SUPER_ADMIN')) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

export const superAdminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Super Admin access required' });
    }
    next();
};

export const userOrAdminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role) {
        return res.status(403).json({ error: 'Access required' });
    }
    next();
};

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [users] = await connection.execute(
                'SELECT * FROM admin_users WHERE email = ? AND isActive = ?',
                [email, true]
            );

            if ((users as any[]).length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = (users as any[])[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            console.log('[LOGIN DEBUG] User role from DB:', user.role);
            const token = jwt.sign(
                { adminId: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: TOKEN_EXPIRY }
            );
            console.log('[LOGIN DEBUG] Token created with role:', user.role);

            res.json({
                token,
                email: user.email,
                role: user.role,
                isSuperAdmin: user.role === 'SUPER_ADMIN'
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post('/admins', authMiddleware, superAdminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [existing] = await connection.execute(
                'SELECT id FROM admin_users WHERE email = ?',
                [email]
            );

            if ((existing as any[]).length > 0) {
                return res.status(400).json({ error: 'Admin already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const adminId = uuidv4();

            await connection.execute(
                'INSERT INTO admin_users (id, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)',
                [adminId, email, hashedPassword, 'ADMIN', true]
            );

            res.status(201).json({ id: adminId, email, role: 'ADMIN' });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/admins', authMiddleware, superAdminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [admins] = await connection.execute(
                'SELECT id, email, role, isActive, createdAt FROM admin_users'
            );

            res.json(admins);
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.delete('/admins/:id', authMiddleware, superAdminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            const [user] = await connection.execute(
                'SELECT role FROM admin_users WHERE id = ?',
                [req.params.id]
            );

            if ((user as any[])[0]?.role === 'SUPER_ADMIN') {
                return res.status(400).json({ error: 'Cannot delete Super Admin' });
            }

            await connection.execute(
                'UPDATE admin_users SET isActive = ? WHERE id = ?',
                [false, req.params.id]
            );

            res.json({ success: true });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    res.json({
        adminId: req.adminId,
        email: req.email,
        role: req.role,
        isSuperAdmin: req.role === 'SUPER_ADMIN',
        isAdmin: req.role === 'ADMIN',
        isUser: req.role === 'USER'
    });
});

// Create User (only SUPER_ADMIN)
router.post('/users', authMiddleware, superAdminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password and name required' });
        }
        const pool = getPool();
        const connection = await pool.getConnection();
        try {
            const [existing] = await connection.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );
            if ((existing as any[]).length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = uuidv4();
            await connection.execute(
                'INSERT INTO users (id, email, password, name, role, isActive) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, email, hashedPassword, name, 'USER', true]
            );
            res.status(201).json({ id: userId, email, name, role: 'USER' });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get Users (only SUPER_ADMIN)
router.get('/users', authMiddleware, superAdminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const pool = getPool();
        const connection = await pool.getConnection();
        try {
            const [users] = await connection.execute(
                'SELECT id, email, name, role, isActive, createdAt FROM users'
            );
            res.json(users);
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Delete User (only SUPER_ADMIN)
router.delete('/users/:id', authMiddleware, superAdminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const pool = getPool();
        const connection = await pool.getConnection();
        try {
            await connection.execute(
                'UPDATE users SET isActive = ? WHERE id = ?',
                [false, req.params.id]
            );
            res.json({ success: true });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// User login
router.post('/user/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        const pool = getPool();
        const connection = await pool.getConnection();
        try {
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE email = ? AND isActive = ? AND role = ?',
                [email, true, 'USER']
            );
            if ((users as any[]).length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const user = (users as any[])[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: TOKEN_EXPIRY }
            );
            res.json({
                token,
                email: user.email,
                role: user.role
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;