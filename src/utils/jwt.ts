import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Use an environment variable for the secret key

export class JwtUtils {
    // static functuion are functions that belong to that class, you dont need to create an instance of that class to call the staticfunction, you can call it directly.
    static generateToken(payload: object, expiresIn: string | number = '1h'): string {
        return jwt.sign(payload, SECRET_KEY as string, { expiresIn });
    }

    static verifyToken(token: string): JwtPayload | null {
        try {
            const decoded = jwt.verify(token, SECRET_KEY as string);
            if (typeof decoded === 'string') {
                return null; // In case the decoded token is a string, return null
            }
            return decoded as JwtPayload; // Type assertion to JwtPayload
        } catch (error) {
            console.error('JWT verification error:', error);
            return null;
        }
    }

    static decodeToken(token: string): JwtPayload | null {
        try {
            const decoded = jwt.decode(token);
            if (typeof decoded === 'string' || decoded === null) {
                return null; // In case the decoded token is a string or null, return null
            }
            return decoded as JwtPayload; // Type assertion to JwtPayload
        } catch (error) {
            console.error('JWT decoding error:', error);
            return null;
        }
    }
}
