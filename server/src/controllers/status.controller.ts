import { Request, Response } from 'express';

export const getHealthStatus = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Full-Stack Express API',
    version: '1.0.0'
  });
};

export const getProjectInfo = (req: Request, res: Response) => {
  res.status(200).json({
    name: 'Full-Stack Modern Web App',
    stack: {
      frontend: 'Next.js 15+ (React 19, TypeScript)',
      backend: 'Node.js, Express (TypeScript)',
      runtime: 'Node.js'
    },
    message: 'Backend server is running and ready for endpoints!'
  });
};
