/**
 * Collaboration and Socket.IO domain types contract (Foundational Stub)
 * To be expanded during Epic F08: Real-Time Collaboration
 */

export interface UserPresence {
  userId: string;
  userName: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
  };
}
