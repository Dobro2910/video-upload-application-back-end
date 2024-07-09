import { AuthenticationRepository } from '../authentication_repository';
import { User, validate } from '../../model/user_model';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { JwtUtils } from "../../utils/jwt";
import { error } from 'console';

export class AuthenticationRepositoryImpl implements AuthenticationRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async login(userEmail: string, userPassword: string): Promise<String | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const result = await postgresDB.query('SELECT user_id, user_password FROM users WHERE user_email = $1', [userEmail]);

            let userId;
            let encryptedPassword;
            if (result.rows.length === 1) {
                const row = result.rows[0];
                userId = row.user_id;
                encryptedPassword = row.user_password;
            } else {
                return null;
            }
            
            const passwordCheck = await bcrypt.compare(userPassword, encryptedPassword);

            if (passwordCheck) {
                const token = JwtUtils.generateToken({ id: userId, email: userEmail });
                return token;
            } else {
                return null;
            }
        } finally {
            // Release the database connection in all cases
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }

    async findUserByEmail(userEmail: string): Promise<User | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const result = await postgresDB.query('SELECT * FROM users WHERE user_email = $1', [userEmail]);
            if (result.rows.length > 0) {
                return result.rows[0] as User;
            }

            return null;
        } finally {
            // Release the database connection in all cases
            if (postgresDB) {
                postgresDB.release();
            }
        }
    };

    async createUser(user: User): Promise<Object | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const validated = validate(user);
            if (validated) {
                throw new Error(validated);
            }
            // Check if user already exists
            const result = await this.findUserByEmail(user.userEmail); // Await the result of findUserByEmail
            if (result != null) {
                // logger.error('Email already exists'); // Log the error
                throw new Error('Email already exists'); // Throw an error if the email already exists
            }
            
            // Hash the user's password
            const hashedPassword = await bcrypt.hash(user.userPassword, 10);
            await postgresDB.query('INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3)', [user.userName, user.userEmail, hashedPassword]);

            // Return the newly created user object without password
            const newUser = {
                userId: user.userId,
                userName: user.userName,
                userEmail: user.userEmail
            };

            return newUser;
        } finally {
            // Release the database connection in all cases
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
        } finally {
            // Release the database connection in all cases
            if (postgresDB) {
                postgresDB.release();
            }
        }
    };
}