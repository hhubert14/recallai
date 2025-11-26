import { UserEntity } from "@/clean-architecture/domain/entities/user.entity"

export interface IUserRepository {
    createUser(id: string, email: string): Promise<UserEntity>
    findUserById(id: string): Promise<UserEntity | null>
    findUserByEmail(email: string): Promise<UserEntity | null>
    // updateUser(id: string, data: UserEntity): Promise<UserEntity>
    deleteUser(id: string): Promise<void>
}