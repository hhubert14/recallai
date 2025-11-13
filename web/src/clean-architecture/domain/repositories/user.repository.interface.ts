import { UserEntity } from "@/clean-architecture/domain/entities/user.entity"

export interface IUserRepository {
    create(email: string): Promise<UserEntity>
    findUserById(id: string): Promise<UserEntity | null>
    findUserByEmail(email: string): Promise<UserEntity | null>
    // update(id: string, data: UserEntity): Promise<UserEntity>
    delete(id: string): Promise<void>
}