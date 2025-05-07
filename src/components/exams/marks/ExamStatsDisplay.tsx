
interface ExamStatsDisplayProps {
  stats: {
    avg: number;
    highest: number;
    lowest: number;
    pass: number;
  };
  maxMarks: number;
}

export function ExamStatsDisplay({ stats, maxMarks }: ExamStatsDisplayProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
      <div className="bg-muted rounded p-3">
        <div className="text-sm text-muted-foreground">Average Score</div>
        <div className="text-xl font-bold">{stats.avg.toFixed(1)} / {maxMarks}</div>
      </div>
      <div className="bg-muted rounded p-3">
        <div className="text-sm text-muted-foreground">Highest Score</div>
        <div className="text-xl font-bold">{stats.highest} / {maxMarks}</div>
      </div>
      <div className="bg-muted rounded p-3">
        <div className="text-sm text-muted-foreground">Lowest Score</div>
        <div className="text-xl font-bold">{stats.lowest} / {maxMarks}</div>
      </div>
      <div className="bg-muted rounded p-3">
        <div className="text-sm text-muted-foreground">Pass Percentage</div>
        <div className="text-xl font-bold">{stats.pass.toFixed(1)}%</div>
      </div>
    </div>
  );
}
