import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { generateTwoFactorSecret, generateQRCode, verifyTwoFactorToken } from "../utils/twoFactor";
import { AuthRequest } from "../middleware/auth";

/**
 * Register a new user
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required",
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user
    const user = await UserModel.create({
      email,
      password,
      name,
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          twoFactorEnabled: user.twoFactorEnabled,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create user",
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user and include password
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // If 2FA is enabled, require verification
    if (user.twoFactorEnabled) {
      // Generate a temporary token for 2FA verification
      const tempToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
      
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        tempToken, // Use this token for 2FA verification
        data: {
          userId: user._id,
        },
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          twoFactorEnabled: user.twoFactorEnabled,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/**
 * Setup 2FA - Generate QR code
 */
export const setupTwoFactor = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate 2FA secret
    const { secret, otpauthUrl } = generateTwoFactorSecret(user.email);
    
    // Generate QR code
    const qrCode = await generateQRCode(otpauthUrl!);

    // Save secret temporarily (not enabled until verified)
    user.twoFactorSecret = secret;
    await user.save();

    res.status(200).json({
      success: true,
      message: "2FA setup initiated",
      data: {
        qrCode,
        secret, // Backup manual entry code
      },
    });
  } catch (error: any) {
    console.error("Setup 2FA error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to setup 2FA",
    });
  }
};

/**
 * Verify and enable 2FA
 */
export const verifyTwoFactor = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const user = await UserModel.findById(req.user.userId).select("+twoFactorSecret");
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: "2FA not setup",
      });
    }

    // Verify token
    const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid 2FA token",
      });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "2FA enabled successfully",
      data: {
        twoFactorEnabled: true,
      },
    });
  } catch (error: any) {
    console.error("Verify 2FA error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify 2FA",
    });
  }
};

/**
 * Login with 2FA token
 */
export const loginWithTwoFactor = async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        message: "User ID and token are required",
      });
    }

    const user = await UserModel.findById(userId).select("+twoFactorSecret");
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: "2FA not enabled for this user",
      });
    }

    // Verify token
    const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid 2FA token",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          twoFactorEnabled: user.twoFactorEnabled,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error("2FA login error:", error);
    res.status(500).json({
      success: false,
      message: "2FA verification failed",
    });
  }
};

/**
 * Disable 2FA
 */
export const disableTwoFactor = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "2FA disabled successfully",
    });
  } catch (error: any) {
    console.error("Disable 2FA error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to disable 2FA",
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    try {
      const decoded = verifyRefreshToken(token);
      
      // Generate new access token
      const accessToken = generateAccessToken({ userId: decoded.userId, email: decoded.email });

      res.status(200).json({
        success: true,
        data: {
          accessToken,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }
  } catch (error: any) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh token",
    });
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      },
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

