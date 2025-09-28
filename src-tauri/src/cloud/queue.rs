use crate::cloud::jobs::Job;
use futures_util::future::FutureExt;
use std::collections::HashMap;
use std::panic::AssertUnwindSafe;
use std::time::Duration;
use tauri::{async_runtime::JoinHandle, AppHandle, Emitter, State};
use tokio::sync::{mpsc, Mutex};

pub struct QueueState {
    pub sender: Mutex<Option<mpsc::Sender<Job>>>,
    pub join_handle: Mutex<Option<JoinHandle<()>>>,
}

#[tauri::command]
pub async fn enqueue_job(
    job_type: String,
    data: HashMap<String, String>,
    state: State<'_, QueueState>,
) -> Result<(), String> {
    let job = match job_type.as_str() {
        "TestSucceeded" => Job::TestSucceeded(data),
        "CompressAndSendPrescription" => Job::CompressAndSendPrescription(data),
        "TestPanic" => Job::TestPanic(data),
        "TestFailed" => Job::TestFailed(data),
        _ => return Err("Unknown job type".into()),
    };

    let sender = state.sender.lock().await;

    match sender.as_ref() {
        Some(queue_state) => {
            if let Err(e) = queue_state.send(job).await {
                eprintln!("Failed to enqueue job: {}", e);
                return Err(format!("Failed to enqueue job: {}", e));
            } else {
                println!("Job enqueued: {:?}", job_type);
                Ok(())
            }
        }
        None => {
            eprintln!("Sender is not available. It might not have been initialized or could have been dropped.");
            Err("Sender is not available. It might not have been initialized or could have been dropped.".into())
        }
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
