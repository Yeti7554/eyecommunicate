import { supabase } from '@/integrations/supabase/client';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface AssassinAssignment {
  playerName: string;
  targetName: string;
  killWord: string;
  gameName: string;
  eliminationMethod: string;
  safeZones?: string;
  safeTimes?: string;
  gameCode: string;
  playerId: string;
}

export interface EliminationNotification {
  eliminatorName: string;
  targetName: string;
  newTargetName: string;
  killWord: string;
  gameName: string;
  playersRemaining: number;
}

class NotificationService {
  private async callSupabaseFunction(functionName: string, payload: any) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Failed to call ${functionName}:`, error);
      throw error;
    }
  }

  async sendAssassinAssignment(assignment: AssassinAssignment & { email: string }) {
    const confirmUrl = `${window.location.origin}/confirm?code=${assignment.gameCode}&player=${assignment.playerId}`;

    const subject = `🎯 Assassin Game: ${assignment.gameName} - Your Assignment`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">🎯 ASSASSIN GAME</h1>
          <h2 style="color: #666; margin: 0;">${assignment.gameName}</h2>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">Hello ${assignment.playerName}!</h3>
          <p style="margin: 15px 0;"><strong>Your target:</strong> ${assignment.targetName}</p>
          <p style="margin: 15px 0;"><strong>Your kill word:</strong> "${assignment.killWord}"</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 10px;">Elimination Method:</h4>
          <p style="margin: 0; color: #666;">${assignment.eliminationMethod}</p>
        </div>

        ${assignment.safeZones ? `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 10px;">Safe Zones:</h4>
          <p style="margin: 0; color: #666;">${assignment.safeZones}</p>
        </div>
        ` : ''}

        ${assignment.safeTimes ? `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 10px;">Safe Times:</h4>
          <p style="margin: 0; color: #666;">${assignment.safeTimes}</p>
        </div>
        ` : ''}

        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #1976d2;">
            <strong>Confirm eliminations:</strong><br>
            <a href="${confirmUrl}" style="color: #1976d2; text-decoration: underline;">${confirmUrl}</a>
          </p>
        </div>

        <div style="text-align: center; color: #666;">
          <p>Good luck, assassin! 🗡️</p>
        </div>
      </div>
    `;

    return this.callSupabaseFunction('send-email', {
      to: assignment.email,
      subject,
      html
    });
  }

  async sendTargetAssignment(assignment: { playerName: string; email: string; gameName: string; eliminationMethod: string; safeZones?: string; safeTimes?: string; gameCode: string; playerId: string }) {
    const confirmUrl = `${window.location.origin}/confirm?code=${assignment.gameCode}&player=${assignment.playerId}`;

    const subject = `🎯 Assassin Game: ${assignment.gameName} - Stay Alert!`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">🎯 ASSASSIN GAME</h1>
          <h2 style="color: #666; margin: 0;">${assignment.gameName}</h2>
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #856404; margin-top: 0;">Hello ${assignment.playerName}!</h3>
          <p style="margin: 15px 0; color: #856404;"><strong>WARNING:</strong> Someone is hunting you! 🏹</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 10px;">Elimination Method:</h4>
          <p style="margin: 0; color: #666;">${assignment.eliminationMethod}</p>
        </div>

        ${assignment.safeZones ? `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 10px;">Safe Zones:</h4>
          <p style="margin: 0; color: #666;">${assignment.safeZones}</p>
        </div>
        ` : ''}

        ${assignment.safeTimes ? `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; margin-bottom: 10px;">Safe Times:</h4>
          <p style="margin: 0; color: #666;">${assignment.safeTimes}</p>
        </div>
        ` : ''}

        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #1976d2;">
            <strong>Confirm eliminations:</strong><br>
            <a href="${confirmUrl}" style="color: #1976d2; text-decoration: underline;">${confirmUrl}</a>
          </p>
        </div>

        <div style="text-align: center; color: #666;">
          <p>Stay alert! 👀</p>
        </div>
      </div>
    `;

    return this.callSupabaseFunction('send-email', {
      to: assignment.email,
      subject,
      html
    });
  }

  async sendEliminationNotification(notification: EliminationNotification & { email: string }) {
    const subject = `🎯 Elimination Confirmed - ${notification.gameName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">🎯 ELIMINATION CONFIRMED!</h1>
          <h2 style="color: #666; margin: 0;">${notification.gameName}</h2>
        </div>

        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #155724; margin-top: 0;">${notification.eliminatorName} eliminated ${notification.targetName}!</h3>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 15px 0;"><strong>Your new target:</strong> ${notification.newTargetName}</p>
          <p style="margin: 15px 0;"><strong>Your kill word:</strong> "${notification.killWord}"</p>
          <p style="margin: 15px 0;"><strong>Players remaining:</strong> ${notification.playersRemaining}</p>
        </div>

        <div style="text-align: center; color: #666;">
          <p>Keep hunting! 🗡️</p>
        </div>
      </div>
    `;

    return this.callSupabaseFunction('send-email', {
      to: notification.email,
      subject,
      html
    });
  }

  async sendGameOverNotification(winner: { name: string; email: string }, gameName: string) {
    const subject = `🏆 Game Over - ${gameName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">🎯 GAME OVER!</h1>
          <h2 style="color: #666; margin: 0;">${gameName}</h2>
        </div>

        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 30px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h2 style="color: #155724; margin-top: 0; font-size: 24px;">🏆 CONGRATULATIONS ${winner.name}! 🏆</h2>
          <p style="color: #155724; margin: 20px 0; font-size: 18px;"><strong>You are the LAST ASSASSIN STANDING!</strong></p>
        </div>

        <div style="text-align: center; color: #666;">
          <p>The hunt is complete. Well played! 🎉</p>
        </div>
      </div>
    `;

    return this.callSupabaseFunction('send-email', {
      to: winner.email,
      subject,
      html
    });
  }

  async sendGamePausedNotification(email: string, gameName: string) {
    const subject = `⏸️ Game Paused - ${gameName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">⏸️ GAME PAUSED</h1>
          <h2 style="color: #666; margin: 0;">${gameName}</h2>
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <p style="margin: 0; color: #856404;">The assassin game has been paused by the host.</p>
        </div>

        <div style="text-align: center; color: #666;">
          <p>Stay tuned for updates! 📱</p>
        </div>
      </div>
    `;

    return this.callSupabaseFunction('send-email', {
      to: email,
      subject,
      html
    });
  }
}

export const notificationService = new NotificationService();