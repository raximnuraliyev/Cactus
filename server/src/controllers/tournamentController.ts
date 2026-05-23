import type { Request, Response, NextFunction } from 'express';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

export interface TournamentLobby {
  id: string;
  hostUsername: string;
  players: string[];
  maxPlayers: number;
  status: 'waiting' | 'active' | 'completed';
  phase?: number;
  roles?: Record<string, string>;
  messages?: Array<{ id: number; type: 'system' | 'user'; sender?: string; content: string; time: string }>;
  tasks?: Array<{ id: number; title: string; rewardXP: number; completedBy: string[] }>;
  xp?: Record<string, number>;
  startTime?: number;
  endTime?: number;
  winner?: 'Bank Staff' | 'Fraudster';
}

// In-memory store for lobbies
const lobbies = new Map<string, TournamentLobby>();

export class TournamentController {
  static async createLobby(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username } = req.body;
      if (!username) throw new ValidationError('Username is required');

      const lobbyId = "CCT-" + Math.floor(1000 + Math.random() * 9000).toString();
      
      const newLobby: TournamentLobby = {
        id: lobbyId,
        hostUsername: username,
        players: [username],
        maxPlayers: 5,
        status: 'waiting',
        messages: [{ id: Date.now(), type: 'system', content: 'Lobby created.', time: '00:00' }]
      };

      lobbies.set(lobbyId, newLobby);

      res.status(201).json({
        success: true,
        data: { lobby: newLobby },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getLobby(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const lobby = lobbies.get(id);

      if (!lobby) throw new NotFoundError('Lobby');

      res.json({
        success: true,
        data: { lobby },
      });
    } catch (err) {
      next(err);
    }
  }

  static async joinLobby(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { username } = req.body;

      if (!username) throw new ValidationError('Username is required');

      const lobby = lobbies.get(id);
      if (!lobby) throw new NotFoundError('Lobby');

      if (!lobby.players.includes(username)) {
        if (lobby.players.length >= lobby.maxPlayers) {
          throw new ValidationError('Lobby is full');
        }
        lobby.players.push(username);
      }

      res.json({
        success: true,
        data: { lobby },
      });
    } catch (err) {
      next(err);
    }
  }

  static async leaveLobby(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { username } = req.body;

      if (!username) throw new ValidationError('Username is required');

      const lobby = lobbies.get(id);
      if (!lobby) throw new NotFoundError('Lobby');

      lobby.players = lobby.players.filter(p => p !== username);
      
      if (lobby.players.length === 0) {
        lobbies.delete(id);
      } else if (lobby.hostUsername === username) {
        lobby.hostUsername = lobby.players[0]; // assign new host
      }

      res.json({
        success: true,
        data: { lobby },
      });
    } catch (err) {
      next(err);
    }
  }

  static async startGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const lobby = lobbies.get(id);
      if (!lobby) throw new NotFoundError('Lobby');

      if (lobby.status !== 'waiting') throw new ValidationError('Game already started');

      lobby.status = 'active';
      lobby.phase = 1;
      lobby.startTime = Date.now();
      lobby.endTime = Date.now() + (5 * 60 * 1000); // 5 mins

      // Assign roles
      const shuffled = [...lobby.players].sort(() => Math.random() - 0.5);
      lobby.roles = {};
      lobby.xp = {};
      shuffled.forEach((player, index) => {
        // First player in shuffled list is Fraudster
        lobby.roles![player] = index === 0 ? 'Fraudster' : 'Bank Staff';
        lobby.xp![player] = 0;
      });

      // Initialize Tasks
      lobby.tasks = [
        { id: 1, title: 'Analyze transaction history', rewardXP: 10, completedBy: [] },
        { id: 2, title: 'Uncover a fake invoice in chat', rewardXP: 5, completedBy: [] },
        { id: 3, title: 'Identify the hidden Fraudster', rewardXP: 50, completedBy: [] },
      ];

      lobby.messages?.push({
        id: Date.now(),
        type: 'system',
        content: 'Operation: Phantom Invoice Initiated. Roles have been secretly assigned.',
        time: '00:00'
      });

      res.json({
        success: true,
        data: { lobby },
      });
    } catch (err) {
      next(err);
    }
  }

  static async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { username, content, time } = req.body;

      if (!username || !content) throw new ValidationError('Username and content are required');

      const lobby = lobbies.get(id);
      if (!lobby) throw new NotFoundError('Lobby');

      lobby.messages?.push({
        id: Date.now(),
        type: 'user',
        sender: username,
        content,
        time: time || '00:00'
      });

      // AI-Driven XP Logic: 30% chance to complete a random uncompleted task
      if (Math.random() < 0.3 && lobby.tasks) {
        const uncompleted = lobby.tasks.filter(t => !t.completedBy.includes(username));
        if (uncompleted.length > 0) {
          const randomTask = uncompleted[Math.floor(Math.random() * uncompleted.length)];
          randomTask.completedBy.push(username);
          if (lobby.xp) {
            lobby.xp[username] = (lobby.xp[username] || 0) + randomTask.rewardXP;
          }
          // Notify the room
          lobby.messages?.push({
            id: Date.now(),
            type: 'system',
            content: `AI System: ${username} achieved objective '${randomTask.title}'. (+${randomTask.rewardXP} XP)`,
            time: time || '00:00'
          });
        }
      }

      res.json({
        success: true,
        data: { lobby },
      });
    } catch (err) {
      next(err);
    }
  }

  static async endGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const lobby = lobbies.get(id);
      if (!lobby) throw new NotFoundError('Lobby');

      if (lobby.status === 'completed') {
        res.json({ success: true, data: { lobby } });
        return;
      }

      lobby.status = 'completed';
      
      // Determine winner randomly or via some mock logic
      lobby.winner = Math.random() > 0.5 ? 'Bank Staff' : 'Fraudster';

      lobby.messages?.push({
        id: Date.now(),
        type: 'system',
        content: `Operation Concluded. ${lobby.winner} Wins!`,
        time: '00:00'
      });

      res.json({
        success: true,
        data: { lobby },
      });
    } catch (err) {
      next(err);
    }
  }

  static async completeTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { username, taskId } = req.body;

      if (!username || !taskId) throw new ValidationError('Username and taskId are required');

      const lobby = lobbies.get(id);
      if (!lobby) throw new NotFoundError('Lobby');

      const task = lobby.tasks?.find(t => t.id === taskId);
      if (!task) throw new NotFoundError('Task');

      if (!task.completedBy.includes(username)) {
        task.completedBy.push(username);
        if (lobby.xp) {
          lobby.xp[username] = (lobby.xp[username] || 0) + task.rewardXP;
        }
      }

      res.json({
        success: true,
        data: { lobby },
      });
    } catch (err) {
      next(err);
    }
  }

}
