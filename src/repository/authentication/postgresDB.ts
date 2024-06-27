import { AuthenticationRepository } from "../authentication_repository";
import { User } from "../../model/user_model";
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthenticationRepositoryImpl implements AuthenticationRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async findUserByEmail(userEmail: string) {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE email = $1', [userEmail]);
            if (result.rows.length > 0) {
                return result.rows[0] as User;
            }
            return null;
        } finally {
            client.release();
        }
    };

    async createUser(user: User) {
        const hashedPassword = await bcrypt.hash(user.userPassword, 10);
        const client = await this.pool.connect();
        try {
            await client.query('INSERT INTO users (email, password) VALUES ($1, $2)', [user.userEmail, hashedPassword]);
        } finally {
            client.release();
        }
    };

    async updateUserPassword(userId: string, newPassword: string) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const client = await this.pool.connect();
        try {
            await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
        } finally {
            client.release();
        }
    };

    async generateAuthToken(userId: string): Promise<string> {
        const token = jwt.sign({ userId }, 'your_secret_key', { expiresIn: '1h' });
        return token;
    }
}