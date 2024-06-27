// Team member interface model
export interface User {
    userId: string;
    userName: string;
    userEmail: string;
    userPassword: string;
}

// Model validation
export function validate(user: User): string {
    if (!user.userId || user.userId.length === 0) {
        return "userId is required";
    }

    if (!user.userName || user.userName.length === 0) {
        return "user name is required";
    }

    if (!user.userEmail || user.userEmail.length === 0) {
        return "email is required";
    }

    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.userEmail)) {
        return "Invalid email format.";
    }

    if (!user.userPassword) {
        return "Password is required.";
    }

    // Additional password checks can be added here
    if (user.userPassword.length < 6) {
        return "Password must be at least 6 characters long.";
    }

    return "";
}
