import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '../utils/jwt';

const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }


    // split the header like this to get the actual jwt token e.g ['Bearer', 'abcdefghijklmnopqrstuvwxyz1234567890']
    const token = authHeader.split(' ')[1];

    const decodedToken = JwtUtils.verifyToken(token);
    if (!decodedToken) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    // This line attaches the decoded token to the req (request) object, under a property named user this will contain the user information, req.user
    // e.g
    // const user = (req as any).user;
    // console.log(user);
    // Output will be:
    // {
    //   userId: '12345',
    //   userEmail: 'john.doe@example.com',
    // }
    (req as any).user = decodedToken; // Attach decoded token to request object
    next();
};

export default jwtMiddleware;
