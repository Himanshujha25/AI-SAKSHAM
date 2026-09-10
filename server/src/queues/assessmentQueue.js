// Simple in-process job queue (BullMQ-compatible swap later).
// If REDIS_URL + bullmq are configured, replace this with a real BullMQ Queue.
const jobs = new Map(); // assessmentId -> timeout handles

function enqueueAssessment(assessmentId, runner, delayMs = 500) {
  cancelAssessment(assessmentId);
  const t = setTimeout(() => runner().catch((e) => console.error('[queue] job failed', e)), delayMs);
  jobs.set(String(assessmentId), t);
  return true;
}

function cancelAssessment(assessmentId) {
  const t = jobs.get(String(assessmentId));
  if (t) {
    clearTimeout(t);
    jobs.delete(String(assessmentId));
    return true;
  }
  return false;
}

module.exports = { enqueueAssessment, cancelAssessment };
