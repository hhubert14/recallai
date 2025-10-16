export class UserEntity {
    id: string;
    email: string;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: string,
        email: string,
        emailVerified: Date | null,
        createdAt: Date,
        updatedAt: Date
    ) {
        this.id = id;
        this.email = email;
        this.emailVerified = emailVerified;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
