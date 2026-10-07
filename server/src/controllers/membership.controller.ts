import { Request, Response } from 'express';
import { membershipService } from '../services/membership.service';
import { sendSuccess } from '../utils/apiResponse';

export class MembershipController {
  /**
   * GET /api/v1/projects/:projectId/members
   */
  public async listMembers(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const projectId = String(req.params.projectId);

    const members = await membershipService.getProjectMembers(userId, projectId);
    sendSuccess(res, { members }, 200);
  }

  /**
   * PATCH /api/v1/projects/:projectId/members/:userId
   */
  public async updateRole(req: Request, res: Response): Promise<void> {
    const requesterId = req.user!.id;
    const projectId = String(req.params.projectId);
    const targetUserId = String(req.params.userId);
    const { role } = req.body;

    const member = await membershipService.updateMemberRole(
      requesterId,
      projectId,
      targetUserId,
      role
    );
    sendSuccess(res, { member }, 200);
  }

  /**
   * DELETE /api/v1/projects/:projectId/members/:userId
   */
  public async removeMember(req: Request, res: Response): Promise<void> {
    const requesterId = req.user!.id;
    const projectId = String(req.params.projectId);
    const targetUserId = String(req.params.userId);

    await membershipService.removeMember(requesterId, projectId, targetUserId);
    sendSuccess(res, { message: 'Member removed successfully' }, 200);
  }
}

export const membershipController = new MembershipController();
