export function scheduleDaily(task: () => Promise<unknown>, hour: number, minute: number): void {
  const runAndReschedule = async () => {
    try {
      await task()
    } catch (error) {
      console.error('Scheduled task failed:', error)
    }
    setTimeout(runAndReschedule, msUntilNextRun(hour, minute))
  }

  setTimeout(runAndReschedule, msUntilNextRun(hour, minute))
}

function msUntilNextRun(hour: number, minute: number): number {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0)
  if (next <= now) {
    next.setDate(next.getDate() + 1)
  }
  return next.getTime() - now.getTime()
}
