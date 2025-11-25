import { UserEntity } from "@/clean-architecture/domain/entities/user.entity";
import { IUserRepository } from "@/clean-architecture/domain/repositories/user.repository.interface";

export class CreateUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(id: string, email: string): Promise<UserEntity> {
        const user = await this.userRepository.createUser(id, email)
        return user
    }
}
