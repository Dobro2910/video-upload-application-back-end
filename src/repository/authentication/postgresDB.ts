import { AuthenticationRepository } from '../authentication_repository';
import { User, validate } from '../../model/user_model';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { JwtUtils } from "../../utils/jwt";

export class AuthenticationRepositoryImplPostgres implements AuthenticationRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async login(userEmail: string, userPassword: string): Promise<string | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const result = await postgresDB.query('SELECT user_id, user_password FROM users WHERE user_email = $1', [userEmail]);

            if (result.rows.length !== 1) {
                return null;
            }

            const row = result.rows[0];
            const userId = row.user_id;
            const encryptedPassword = row.user_password;

            const passwordCheck = await bcrypt.compare(userPassword, encryptedPassword);

            if (passwordCheck) {
                const token = JwtUtils.generateToken({ id: userId, email: userEmail });
                return token;
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }

    async getUserByEmail(userEmail: string): Promise<User | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const result = await postgresDB.query('SELECT * FROM users WHERE user_email = $1', [userEmail]);

            if (result.rows.length > 0) {
                return result.rows[0] as User;
            }

            return null;
        } catch (error) {
            throw error;
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }

    async createUser(user: User): Promise<string | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const validationError = validate(user);
            if (validationError) {
                throw new Error(validationError);
            }

            const existingUser = await this.getUserByEmail(user.userEmail);
            if (existingUser) {
                return null;
            }

            const hashedPassword = await bcrypt.hash(user.userPassword, 10);
            await postgresDB.query('INSERT INTO users (user_name, user_email, user_password, user_role) VALUES ($1, $2, $3, $4)', [user.userName, user.userEmail, hashedPassword, user.userRole]);

            return 'Successful Registration';
        } catch (error) {
            throw error;
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }

    async updateUserPassword(userEmail: string, newPassword: string): Promise<void> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await postgresDB.query('UPDATE users SET user_password = $1 WHERE user_email = $2', [hashedPassword, userEmail]);
        } catch (error) {
            throw error;
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }
}
