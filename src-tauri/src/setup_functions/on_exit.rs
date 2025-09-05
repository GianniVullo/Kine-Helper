use crate::cloud::queue::QueueState;
#[cfg(not(target_os = "ios"))]
use sqlx::{query, Connection, SqliteConnection};
use tauri::AppHandle;
use tauri::Manager;

pub fn wait_for_queue_to_finish_then_shutdown(app: &AppHandle) {
    let app_handle = app.clone();
    let (tx, rx) = tokio::sync::oneshot::channel();
    let _exiting_thread_handle = tauri::async_runtime::spawn(async move {
        if let Some(queue_state) = app_handle.try_state::<QueueState>() {
            // Drop the sender (signal shutdown)
            let mut sender_guard = queue_state.sender.lock().await;
            if sender_guard.take().is_some() {
                println!("Sender dropped.");
            }

            let mut handle_guard = queue_state.join_handle.lock().await;
            if let Some(handle) = handle_guard.take() {
                // Wait for the queue to finish processing
                if let Err(e) = handle.await {
                    // TODO : here we should at least store the error in a dedicated database table so that we can inform the user on what went wrong when he gets back. For the cloud users we could even store the error on the server to inform him wherever he connects from the next time.
                    eprintln!("Error while waiting for queue: {:?}", e);
                } else {
                    // If everything went well then, bye bye
                    println!("Queue finished processing.");
                }
            } else {
                println!("Join handle already dropped.");
            }
        }
        println!("Exiting application...");
        let _ = tx.send(());
    });
    rx.blocking_recv().expect("Failed to receive exit signal");
}

#[cfg(not(target_os = "ios"))]
fn path_mapper(mut app_path: std::path::PathBuf, connection_string: &str) -> String {
    app_path.push(
        connection_string
            .split_once(':')
            .expect("Couldn't parse the connection string for DB!")
            .1,
    );

    format!(
        "sqlite:{}",
        app_path
            .to_str()
            .expect("Problem creating fully qualified path to Database file!")
    )
}

#[cfg(not(target_os = "ios"))]
pub fn clear_sqlite_cache(app: &AppHandle) {
    let app_path = app
        .path()
        .app_config_dir()
        .expect("No App config path was found!");

    let conn_url = &path_mapper(app_path, "sqlite:kinehelper.db");

    let mut conn = match tauri::async_runtime::block_on(SqliteConnection::connect(conn_url)) {
        Ok(conn) => conn,
        Err(e) => {
            eprintln!("Error connecting to database: {:?}", e);
            return;
        }
    };

    let resp =
        match tauri::async_runtime::block_on(query("DELETE FROM patients;").execute(&mut conn)) {
            Ok(resp) => resp,
            Err(e) => {
                eprintln!("Error deleting patients: {:?}", e);
                return;
            }
        };
    println!(
        "Deleted {} patients from the database.",
        resp.rows_affected()
    );
}
