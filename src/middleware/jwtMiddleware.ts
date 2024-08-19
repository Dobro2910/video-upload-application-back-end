// import { Request, Response, NextFunction } from 'express';
// import { JwtUtils } from '../utils/jwt';

// const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         return res.status(401).json({ error: 'No token provided' });
//     }

//     // split the header like this to get the actual jwt token e.g ['Bearer', 'abcdefghijklmnopqrstuvwxyz1234567890']
//     const token = authHeader.split(' ')[1];

//     const decodedToken = JwtUtils.verifyToken(token);
//     if (!decodedToken) {
//         return res.status(401).json({ error: 'Invalid token' });
//     }

//     // This line attaches the decoded token to the req (request) object, under a property named user this will contain the user information, req.user
//     // e.g
//     // const user = (req as any).user;
//     // console.log(user);
//     // Output will be:
//     // {
//     //   userId: '12345',
//     //   userEmail: 'john.doe@example.com',
//     // }
//     (req as any).user = decodedToken; // Attach decoded token to request object
//     next();
// };

// export default jwtMiddleware;

import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '../utils/jwt';

const jwtMiddleware = (requiredRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];

    try {
      // Verify the token, check if the token is still valid within the time limit (1 hour)
      const decodedToken = JwtUtils.verifyToken(token);
      if (!decodedToken) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Attach decoded token to the user variable of the request object, so now when you call req.user, it will be req.decodedToken
      (req as any).user = decodedToken;

      // Check if the user has one of the required roles
      if (requiredRoles.length > 0 && !requiredRoles.includes(decodedToken.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient role' });
      }

      next(); // User is authorized, proceed to the next middleware
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

export default jwtMiddleware;
