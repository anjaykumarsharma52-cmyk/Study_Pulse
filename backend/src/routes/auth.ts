import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required' },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: 'Password must be at least 6 characters' },
      });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.message },
      });
    }

    // Sign in the user immediately after creation to get a session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError || !sessionData.session) {
      return res.status(400).json({
        success: false,
        error: { message: 'User created but failed to create session' },
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        token: sessionData.session.access_token,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required' },
      });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' },
      });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        token: data.session?.access_token || '',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

export default router;