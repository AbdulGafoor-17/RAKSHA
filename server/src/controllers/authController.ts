import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { dbStore } from '../services/dbStore.js';
import { SEED_USERS } from '../seeds/seedData.js';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role, phone, organization, location } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      const existing = await dbStore.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await dbStore.createUser({
        name,
        email,
        passwordHash,
        role: role || 'citizen',
        phone,
        organization,
        location: location || { type: 'Point', coordinates: [-122.4150, 37.7750] }
      });

      const token = jwt.sign(
        { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          organization: user.organization,
          location: user.location
        }
      });
    } catch (err: any) {
      console.error('Register error:', err);
      return res.status(500).json({ error: 'Registration failed.' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = await dbStore.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = jwt.sign(
        { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          organization: user.organization,
          location: user.location
        }
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Login failed.' });
    }
  },

  async getMe(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided.' });
      }

      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, ENV.JWT_SECRET);

      const user = await dbStore.findUserById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.json({
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          organization: user.organization,
          location: user.location
        }
      });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
  },

  // Instant switch for demo testing (Quickly toggle between Citizen, Authority, Shelter Admin)
  async demoSwitch(req: Request, res: Response) {
    try {
      const { role } = req.body;
      const targetSeed = SEED_USERS.find((u) => u.role === role) || SEED_USERS[0];
      const user = await dbStore.findUserByEmail(targetSeed.email);

      if (!user) {
        return res.status(404).json({ error: 'Demo user not found.' });
      }

      const token = jwt.sign(
        { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          organization: user.organization,
          location: user.location
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Demo switch failed.' });
    }
  }
};
