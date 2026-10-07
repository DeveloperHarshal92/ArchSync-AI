import { Request, Response } from 'express';
import { CreateInvitationRequest } from '@archsync/shared';
import { invitationService } from '../services/invitation.service';
import { sendSuccess } from '../utils/apiResponse';

export class InvitationController {
  /**
   * POST /api/v1/projects/:projectId/invitations
   */
  public async create(req: Request, res: Response): Promise<void> {
    const requesterId = req.user!.id;
    const projectId = String(req.params.projectId);
    const body: CreateInvitationRequest = req.body;

    const invitation = await invitationService.createInvitation(
      requesterId,
      projectId,
      body
    );
    sendSuccess(res, { invitation }, 201);
  }

  /**
   * GET /api/v1/invitations
   */
  public async listUserInvitations(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    const invitations = await invitationService.getUserInvitations(userId, userEmail);
    sendSuccess(res, { invitations }, 200);
  }

  /**
   * POST /api/v1/invitations/:invitationId/accept
   */
  public async accept(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    const invitationId = String(req.params.invitationId);

    const result = await invitationService.acceptInvitation(
      userId,
      userEmail,
      invitationId
    );
    sendSuccess(res, result, 200);
  }

  /**
   * POST /api/v1/invitations/:invitationId/reject
   */
  public async reject(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    const invitationId = String(req.params.invitationId);

    const invitation = await invitationService.rejectInvitation(
      userId,
      userEmail,
      invitationId
    );
    sendSuccess(res, { invitation }, 200);
  }
}

export const invitationController = new InvitationController();
