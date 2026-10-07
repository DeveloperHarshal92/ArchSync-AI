import { Router } from 'express';
import { healthRouter } from './health.routes';
import { authRouter } from './auth.routes';
import { projectRouter } from './project.routes';
import { invitationRouter } from './invitation.routes';
import { aiRouter } from './ai.routes';

export const apiV1Router = Router();

// Mount API v1 route modules
apiV1Router.use('/health', healthRouter);
apiV1Router.use('/auth', authRouter);
apiV1Router.use('/projects', projectRouter);
apiV1Router.use('/invitations', invitationRouter);
apiV1Router.use('/ai', aiRouter);

