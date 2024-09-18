import { AuthenticationRepository } from '../authentication_repository';
import { User, validate, UpdateProfile } from '../../model/user_model';
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
            const result = await postgresDB.query('SELECT user_id, user_password, user_role FROM users_prod WHERE user_email = $1', [userEmail]);

            if (result.rows.length !== 1) {
                return null;
            }

            const row = result.rows[0];
            const userId = row.user_id;
            const encryptedPassword = row.user_password;
            const userRole = row.user_role;

            const passwordCheck = await bcrypt.compare(userPassword, encryptedPassword);

            if (passwordCheck) {
                // id, email, role is in the payload
                const token = JwtUtils.generateToken({ id: userId, email: userEmail, role: userRole });
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

    async getUserByEmail(userEmail: string): Promise<UpdateProfile | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();
            const result = await postgresDB.query('SELECT * FROM users_prod WHERE user_email = $1', [userEmail]);

            // if (result.rows.length > 0) {
            //     return result.rows[0] as User;
            // }
            if (result.rows.length > 0) {
                const user = result.rows[0];
                
                return {
                    userName: user.user_name,    // Assuming the field is named userName
                    userEmail: user.user_email,  // Assuming the field is named userEmail
                    userRole: user.user_role,    // Assuming the field is named userRole
                    userImage: user.user_image   // Assuming the field is named userImage
                } as UpdateProfile;
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

            await postgresDB.query('INSERT INTO users_prod (user_name, user_email, user_password, user_role) VALUES ($1, $2, $3, $4)', [user.userName, user.userEmail, hashedPassword, user.userRole]);

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
            await postgresDB.query('UPDATE users_prod SET user_password = $1 WHERE user_email = $2', [hashedPassword, userEmail]);
        } catch (error) {
            throw error;
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }

    async updateUserProfile(user: UpdateProfile, userEmail: string): Promise<string | null> {
        let postgresDB;
        try {
            postgresDB = await this.pool.connect();

            // Check if user properties are provided to avoid unnecessary errors
            if (!userEmail) {
                throw new Error('No email is provided');
            }

            const existingUser = await this.getUserByEmail(userEmail);
            if (!existingUser) {
                return null;
            }

            // Build the dynamic query
            const fieldsToUpdate: string[] = [];
            const values: any[] = [];

            // Check if each field is not null and add it to the update query
            if (user.userName) {
                fieldsToUpdate.push('user_name = $' + (values.length + 1));
                values.push(user.userName);
            }

            if (user.userEmail) {
                fieldsToUpdate.push('user_email = $' + (values.length + 1));
                values.push(user.userEmail);
            }

            if (user.userImage) {
                fieldsToUpdate.push('user_image = $' + (values.length + 1));
                values.push(user.userImage);
            }

            // Ensure there are fields to update
            if (fieldsToUpdate.length > 0) {
                // Add the condition for WHERE clause (the original userEmail)
                values.push(userEmail);

                const query = `
                    UPDATE users_prod
                    SET ${fieldsToUpdate.join(', ')}
                    WHERE user_email = $${values.length};
                `;

                // Perform the update query
                await postgresDB.query(query, values);
            }

            return 'Update User Successful';
        } catch (error) {
            throw error;
        } finally {
            if (postgresDB) {
                postgresDB.release();
            }
        }
    }
}
