use crate::cloud::jobs::Job;
use futures_util::future::FutureExt;
use std::collections::HashMap;
use std::panic::AssertUnwindSafe;
use std::time::Duration;
use tauri::{AppHandle, Emitter, State};
use tokio::sync::mpsc;

pub struct QueueState {
    pub sender: mpsc::Sender<Job>,
}

#[tauri::command]
pub async fn enqueue_job(
    job_type: String,
    data: HashMap<String, String>,
    state: State<'_, QueueState>,
) -> Result<(), String> {
    let job = match job_type.as_str() {
        "TestSucceeded" => Job::TestSucceeded(data),
        "SendHistoryNode" => Job::SendHistoryNode(data),
        "CompressAndSendPrescription" => Job::CompressAndSendPrescription(data),
        "TestPanic" => Job::TestPanic(data),
        "TestFailed" => Job::TestFailed(data),
        _ => return Err("Unknown job type".into()),
    };
    if let Err(e) = state.sender.send(job).await {
        eprintln!("Failed to enqueue job: {}", e);
        return Err("Failed to enqueue job".into());
    } else {
        println!("Job enqueued: {:?}", job_type);
        Ok(())
    }
}

async fn handle_job(job: Job, app: AppHandle) {
    const MAX_RETRIES: usize = 3;
    let mut attempts = 0;

    loop {
        attempts += 1;

        let result = AssertUnwindSafe(job.execute(&app)).catch_unwind().await;

        match result {
            Ok(Ok(())) => break, // job succeeded
            Ok(Err(e)) => {
                eprintln!("Job error (try {}): {}", attempts, e);
            }
            Err(_) => {
                eprintln!("Job panicked (try {})", attempts);
            }
        }

        if attempts >= MAX_RETRIES {
            let _ = app.emit("job-failed", job.id());
            break;
        }

        tokio::time::sleep(Duration::from_secs(2)).await;
    }
}

// Sequential queue runner
pub async fn run_queue(mut rx: mpsc::Receiver<Job>, app: AppHandle) {
    while let Some(job) = rx.recv().await {
        handle_job(job, app.clone()).await;
    }
}
