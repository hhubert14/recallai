import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateUserUseCase } from "./create-user.use-case";
import { IUserRepository } from "@/clean-architecture/domain/repositories/user.repository.interface";
import { UserEntity } from "@/clean-architecture/domain/entities/user.entity";

describe("CreateUserUseCase", () => {
	let useCase: CreateUserUseCase;
	let mockUserRepo: IUserRepository;

	beforeEach(() => {
		mockUserRepo = {
			createUser: vi.fn(),
			findUserById: vi.fn(),
			findUserByEmail: vi.fn(),
			deleteUser: vi.fn(),
		};
		useCase = new CreateUserUseCase(mockUserRepo);
	});

	it("should create user with provided id and email", async () => {
		const expectedUser = new UserEntity("user-123", "test@example.com");
		vi.mocked(mockUserRepo.createUser).mockResolvedValue(expectedUser);

		await useCase.execute("user-123", "test@example.com");

		expect(mockUserRepo.createUser).toHaveBeenCalledWith(
			"user-123",
			"test@example.com"
		);
	});

	it("should return the created UserEntity", async () => {
		const expectedUser = new UserEntity("user-123", "test@example.com");
		vi.mocked(mockUserRepo.createUser).mockResolvedValue(expectedUser);

		const result = await useCase.execute("user-123", "test@example.com");

		expect(result).toEqual(expectedUser);
		expect(result.id).toBe("user-123");
		expect(result.email).toBe("test@example.com");
	});

	it("should propagate repository errors", async () => {
		vi.mocked(mockUserRepo.createUser).mockRejectedValue(
			new Error("DB error")
		);

		await expect(
			useCase.execute("user-123", "test@example.com")
		).rejects.toThrow("DB error");
	});
});
