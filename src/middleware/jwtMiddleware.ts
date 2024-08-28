import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '../utils/jwt';

const jwtMiddleware = (requiredRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("No token provided");
      return res.status(401).json({ error: 'No token provided' });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];

    try {
      // Verify the token, check if the token is still valid within the time limit (1 hour)
      const decodedToken = JwtUtils.verifyToken(token);
      if (!decodedToken) {
        console.log("Invalid token");
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Attach decoded token to the user variable of the request object, so now when you call req.user, it will be req.decodedToken
      (req as any).user = decodedToken;

      // Check if the user has one of the required roles
      if (requiredRoles.length > 0 && !requiredRoles.includes(decodedToken.role)) {
        console.log("Forbidden: Insufficient role");
        return res.status(403).json({ error: 'Forbidden: Insufficient role' });
      }

      next(); // User is authorized, proceed to the next middleware
    } catch (error) {
      console.log("Invalid token");
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

export default jwtMiddleware;
