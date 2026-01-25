export type StudySetSourceType = "video" | "manual" | "pdf";

export class StudySetEntity {
  constructor(
    public readonly id: number,
    public readonly publicId: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly sourceType: StudySetSourceType,
    public readonly videoId: number | null,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  isVideoSourced(): boolean {
    return this.sourceType === "video";
  }

  isManual(): boolean {
    return this.sourceType === "manual";
  }
}
