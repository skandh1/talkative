import { Request, Response } from 'express';
import { z } from 'zod';
import { CallService } from '../services/call.services';
import { safeParse, createErrorResponse } from '../utils/zod';

const startCallSchema = z.object({
  calleeId: z.string()
});

const callActionSchema = z.object({
  callId: z.string()
});

const endCallSchema = z.object({
  callId: z.string(),
  reason: z.enum(['hangup', 'failed']).optional()
});

export class CallController {
  static async startCall(req: Request, res: Response) {
    try {
      const { calleeId } = safeParse(startCallSchema, req.body);
      const callerId = req.userId!;
      
      if (callerId === calleeId) {
        return res.status(400).json(createErrorResponse('INVALID_CALLEE', 'Cannot call yourself'));
      }
      
      const call = await CallService.startCall(callerId, calleeId);
      res.json(call);
    } catch (error) {
      res.status(500).json(createErrorResponse('START_CALL_ERROR', (error as Error).message));
    }
  }

  static async acceptCall(req: Request, res: Response) {
    try {
      const { callId } = safeParse(callActionSchema, req.body);
      const calleeId = req.userId!;
      
      const call = await CallService.acceptCall(callId, calleeId);
      res.json({ call, sessionId: callId });
    } catch (error) {
      res.status(500).json(createErrorResponse('ACCEPT_CALL_ERROR', (error as Error).message));
    }
  }

  static async declineCall(req: Request, res: Response) {
    try {
      const { callId } = safeParse(callActionSchema, req.body);
      const calleeId = req.userId!;
      
      const call = await CallService.declineCall(callId, calleeId);
      res.json(call);
    } catch (error) {
      res.status(500).json(createErrorResponse('DECLINE_CALL_ERROR', (error as Error).message));
    }
  }

  static async cancelCall(req: Request, res: Response) {
    try {
      const { callId } = safeParse(callActionSchema, req.body);
      const callerId = req.userId!;
      
      const call = await CallService.cancelCall(callId, callerId);
      res.json(call);
    } catch (error) {
      res.status(500).json(createErrorResponse('CANCEL_CALL_ERROR', (error as Error).message));
    }
  }

  static async endCall(req: Request, res: Response) {
    try {
      const { callId, reason } = safeParse(endCallSchema, req.body);
      const userId = req.userId!;
      
      const call = await CallService.endCall(callId, userId);
      res.json(call);
    } catch (error) {
      res.status(500).json(createErrorResponse('END_CALL_ERROR', (error as Error).message));
    }
  }
}