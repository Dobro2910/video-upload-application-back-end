import { AuthenticationRepository } from '../authentication_repository';
import { User, validate } from '../../model/user_model';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import logger from '../../utils/logger';

export class AuthenticationRepositoryImpl implements AuthenticationRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async findUserByEmail(userEmail: string): Promise<User | null> {
        const postgresDB = await this.pool.connect();
        try {
            const result = await postgresDB.query('SELECT * FROM users WHERE email = $1', [userEmail]);
            if (result.rows.length > 0) {
                return result.rows[0] as User;
            }
            return null;
        } catch(error) {
            // Log and re-throw any errors
            logger.error(`Finding Email: ${(error as Error).message}`);
            throw error;
        } finally {
            // Release the database connection in all cases
            if (postgresDB) {
                postgresDB.release();
            }
        }
    };

    async createUser(user: User): Promise<User | null> {
        // Connect to the database
        const postgresDB = await this.pool.connect();
        try {
            const validated = validate(user);
            if (validated) {
                throw new Error(validated);
            }

            // Check if user already exists
            const result = await this.findUserByEmail(user.userEmail); // Await the result of findUserByEmail
            if (result != null) {
                logger.error('Email already exists'); // Log the error
                throw new Error('Email already exists'); // Throw an error if the email already exists
            }
            
            // Hash the user's password
            const hashedPassword = await bcrypt.hash(user.userPassword, 10);
            // Insert user into the database
            await postgresDB.query('INSERT INTO users (userName, userEmail, userPassword) VALUES ($1, $2, $3)', [user.userName, user.userEmail, hashedPassword]);
            return user;
        } catch(error) {
            // Log and re-throw any errors
            logger.error(`Error creating user: ${(error as Error).message}`);
            throw error;
        } finally {
            // Release the database connection in all cases
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }

    async updateUserPassword(userEmail: string, newPassword: string): Promise<void> {
        const postgresDB = await this.pool.connect();
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await postgresDB.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userEmail]);
        } catch(error) {
            // Log and re-throw any errors
            logger.error(`Error updating password: ${(error as Error).message}`);
            throw error;
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    };
}