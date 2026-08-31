export interface SubmissionRef { current: boolean; }

export async function runSingleSubmit(
  submission: SubmissionRef,
  setLoading: (loading: boolean) => void,
  operation: () => Promise<void>
): Promise<boolean> {
  if (submission.current) return false;
  submission.current = true;
  setLoading(true);
  try {
    await operation();
    return true;
  } finally {
    submission.current = false;
    setLoading(false);
  }
}
