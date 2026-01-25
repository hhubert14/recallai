export class FolderEntity {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}
}
