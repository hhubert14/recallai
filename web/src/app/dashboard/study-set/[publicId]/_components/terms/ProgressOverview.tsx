import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import type { StudySetProgress } from "../types";

interface ProgressOverviewProps {
    progress: StudySetProgress;
}

export function ProgressOverview({ progress }: ProgressOverviewProps) {
    const { mastered, learning, notStarted, total } = progress;

    const masteredPercent = total > 0 ? (mastered / total) * 100 : 0;
    const learningPercent = total > 0 ? (learning / total) * 100 : 0;
    const notStartedPercent = total > 0 ? (notStarted / total) * 100 : 0;

    return (
        <section className="border border-border rounded-lg bg-card p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">
                Progress
            </h3>

            {/* Progress bar */}
            <div
                role="progressbar"
                aria-valuenow={Math.round(masteredPercent)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${mastered} of ${total} terms mastered`}
                className="h-2 w-full rounded-full bg-muted overflow-hidden flex"
            >
                {masteredPercent > 0 && (
                    <div
                        className="h-full bg-green-500"
                        style={{ width: `${masteredPercent}%` }}
                    />
                )}
                {learningPercent > 0 && (
                    <div
                        className="h-full bg-amber-500"
                        style={{ width: `${learningPercent}%` }}
                    />
                )}
                {notStartedPercent > 0 && (
                    <div
                        className="h-full bg-muted"
                        style={{ width: `${notStartedPercent}%` }}
                    />
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-3 text-sm">
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{mastered}</span>
                    <span className="text-muted-foreground">Mastered</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <CircleDot className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{learning}</span>
                    <span className="text-muted-foreground">Still learning</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{notStarted}</span>
                    <span className="text-muted-foreground">Not started</span>
                </div>
            </div>
        </section>
    );
}
