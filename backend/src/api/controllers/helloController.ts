import { Request, Response } from "express";

export const hello = (req: Request, res: Response) => {
  res.status(200).json({
    message: "Hello World!",
    timestamp: new Date().toISOString(),
    success: true,
  });
};

export const helloName = (req: Request, res: Response) => {
  const { name } = req.params;
  if (!name) {
    return res.status(400).json({
      message: "Name parameter is required",
      success: false,
    });
  }

  res.status(200).json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
    success: true,
  });
};

export const health = (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    message: "API is running successfully",
    timestamp: new Date().toISOString(),
    success: true,
  });
};
