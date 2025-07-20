use crate::cloud::{image_compression::tiff_to_avif, postgrest::create_client};
// use base64::{engine::general_purpose::STANDARD, Engine as _};
// use postgrest::Postgrest;
use std::{collections::HashMap, time::Duration};

use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone)]
pub enum Job {
    TestSucceeded(HashMap<String, String>),
    TestPanic(HashMap<String, String>),
    TestFailed(HashMap<String, String>),
    SendHistoryNode(HashMap<String, String>),
    CompressAndSendPrescription(HashMap<String, String>),
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
struct DocumentDetails {
    from: String,
    file_path: String,
    file_name: String,
}

impl Job {
    /// Emit events and run the actual job logic
    pub async fn execute(&self, app: &AppHandle) -> Result<(), String> {
        match self {
            Job::SendHistoryNode(data) => {
                /*
                 * - Emit "job-started" event
                 * - create an history node and receive its order
                 * - sync it with the server if the expected order is not the order received from the server
                 * - update the local database history node
                 * - emit "job-success" event
                 */

                app.emit("job-started", self.id()).ok();

                // create client to communicate with supabase
                let client = create_client();

                // send the history node to the server
                let resp = match client
                    .rpc("insert_history_node", data.get("data").unwrap())
                    .auth(data.get("token").unwrap())
                    .execute()
                    .await
                {
                    Ok(resp) => resp,
                    Err(e) => {
                        return Err(format!("Failed to send history node: {}", e));
                    }
                };

                let order = match resp.text().await {
                    Ok(order) => order,
                    Err(e) => {
                        return Err(format!("Failed to parse response: {}", e));
                    }
                };
                println!("Received order: {}", order);

                // check if the order is the same as the one received from the server

                app.emit("job-success", self.id()).ok();
                Ok(())
            }
            Job::TestSucceeded(_) => {
                app.emit("job-started", self.id()).ok();

                tokio::time::sleep(Duration::from_secs(10)).await;

                app.emit("job-success", self.id()).ok();
                Ok(())
            }
            Job::TestPanic(_) => {
                app.emit("job-started", self.id()).ok();
                panic!("Simulated panic");
            }
            Job::TestFailed(_) => {
                app.emit("job-started", self.id()).ok();
                return Err("Simulated failure".into());
            }
            Job::CompressAndSendPrescription(data) => {
                app.emit("job-started", self.id()).ok();
                println!("Compressing and sending prescription with data: {:?}", data);

                // Transformer le fichier au chemin donné en avif bytes et, si l'utilisateur est cloud, l'envoier au serveur

                let json_data: DocumentDetails =
                    serde_json::from_str(data.get("data").unwrap()).unwrap();

                let from = json_data.from;
                let file_path = json_data.file_path;
                let file_name = json_data.file_name;
                let avif_bytes = tiff_to_avif(&from, &file_path, &file_name);
                let to = format!("{}/{}", file_path, file_name);

                // Check if path exists
                if !std::path::Path::new(&file_path).exists() {
                    // Create the directories if they doesn't exist
                    std::fs::create_dir_all(&file_path)
                        .map_err(|e| format!("Failed to create directory {}: {}", file_path, e))?;
                }

                // write the avif bytes to a file
                let _ = std::fs::write(to, avif_bytes);

                let _ = std::fs::remove_file(from);

                // if the user is cloud, send the file to the server
                // prblm postrgrest-rs doesn't contain a storage client... we'll have to use the supabase js client to send the file after its compression
                // if data.get("user_type").unwrap() == "cloud" {}

                app.emit("job-success", self.id()).ok();
                Ok(())
            }
        }
    }

    pub fn id(&self) -> String {
        let data = match self {
            Job::TestSucceeded(data)
            | Job::SendHistoryNode(data)
            | Job::TestFailed(data)
            | Job::TestPanic(data)
            | Job::CompressAndSendPrescription(data) => data,
        };
        data.get("id")
            .cloned()
            .unwrap_or_else(|| "unknown".to_string())
    }
}
