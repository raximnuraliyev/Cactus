import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { transaction } from '../config/database.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { UserStatsRepository } from '../repositories/UserStatsRepository.js';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository.js';
import { AppError, ConflictError, UnauthorizedError } from '../middleware/errorHandler.js';
import type { JwtPayload } from '../middleware/auth.js';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  private userRepo = new UserRepository();
  private statsRepo = new UserStatsRepository();
  private tokenRepo = new RefreshTokenRepository();

  async register(input: RegisterInput): Promise<AuthTokens & { user: any }> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const result = await transaction(async (client) => {
      const user = await this.userRepo.create(
        {
          username: input.username,
          email: input.email,
          password_hash: passwordHash,
        },
        client
      );
      await this.statsRepo.create(user.id, client);
      return user;
    });

    const tokens = await this.generateTokens(result);
    return {
      ...tokens,
      user: this.sanitizeUser(result),
    };
  }

  async guestLogin(): Promise<AuthTokens & { user: any }> {
    const guestId = crypto.randomBytes(4).toString('hex');
    const username = `Guest_${guestId}`;
    const email = `guest_${guestId}@cactus.local`;
    const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), SALT_ROUNDS);

    const user = await transaction(async (client) => {
      const newUser = await this.userRepo.create(
        {
          username,
          email,
          password_hash: passwordHash,
        },
        client
      );
      await this.statsRepo.create(newUser.id, client);
      return newUser;
    });

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async login(input: LoginInput): Promise<AuthTokens & { user: any }> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user || !user.password_hash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(input.password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async loginWithTelegram(telegramUser: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  }): Promise<AuthTokens & { user: any }> {
    let user = await this.userRepo.findByTelegramId(telegramUser.id);

    if (!user) {
      const username =
        telegramUser.username ||
        `${telegramUser.first_name}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`;

      const language = (['en', 'ru', 'uz'] as const).includes(
        telegramUser.language_code as any
      )
        ? (telegramUser.language_code as 'en' | 'ru' | 'uz')
        : 'en';

      user = await transaction(async (client) => {
        const newUser = await this.userRepo.create(
          {
            username,
            telegram_id: telegramUser.id,
            avatar_url: telegramUser.photo_url,
            language,
          },
          client
        );
        await this.statsRepo.create(newUser.id, client);
        return newUser;
      });
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.tokenRepo.findByHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Revoke old token (rotation)
    await this.tokenRepo.revoke(stored.id);

    const user = await this.userRepo.findById(stored.user_id);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return this.generateTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.tokenRepo.findByHash(tokenHash);
    if (stored) {
      await this.tokenRepo.revoke(stored.id);
    }
  }

  private async generateTokens(user: {
    id: string;
    role: string;
    language: string;
  }): Promise<AuthTokens> {
    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
      language: user.language,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );

    await this.tokenRepo.create(user.id, tokenHash, expiresAt);

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private sanitizeUser(user: any) {
    const { password_hash, deleted_at, ...rest } = user;
    return rest;
  }
}
