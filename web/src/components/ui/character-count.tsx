interface CharacterCountProps {
    current: number;
    max: number;
}

export function CharacterCount({ current, max }: CharacterCountProps) {
    const isOverLimit = current > max;
    return (
        <span
            className={`text-xs ${isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"}`}
        >
            {current}/{max}
        </span>
    );
}
