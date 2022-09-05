import { Request, Response } from 'express';

const userSignupController = async (req: Request, res: Response) => {
  res.send('userSignupController');
};

export {
  userSignupController
}