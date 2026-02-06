import { IUserRepository } from "@/clean-architecture/domain/repositories/user.repository.interface";

export class CheckEmailExistsUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string): Promise<boolean> {
    const user = await this.userRepository.findUserByEmail(email);
    return user !== null;
  }
}
