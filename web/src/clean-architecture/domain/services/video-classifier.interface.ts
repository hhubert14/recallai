export interface IVideoClassifierService {
    isEducational(
        title: string,
        description: string,
        transcript: string
    ): Promise<boolean | undefined>;
}
