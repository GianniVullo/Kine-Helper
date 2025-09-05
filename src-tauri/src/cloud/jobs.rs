use crate::cloud::image_compression::tiff_to_avif;
// use base64::{engine::general_purpose::STANDARD, Engine as _};
// use postgrest::Postgrest;
use std::{collections::HashMap, time::Duration};

use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone)]
pub enum Job {
    TestSucceeded(HashMap<String, String>),
    TestPanic(HashMap<String, String>),
    TestFailed(HashMap<String, String>),
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

                let avif_bytes =
                    tiff_to_avif(&json_data.from, &json_data.file_path, &json_data.file_name);
                let to = format!("{}/{}", &json_data.file_path, &json_data.file_name);

                // Check if path exists
                if !std::path::Path::new(&json_data.file_path).exists() {
                    // Create the directories if they doesn't exist
                    std::fs::create_dir_all(&json_data.file_path).map_err(|e| {
                        format!("Failed to create directory {}: {}", &json_data.file_path, e)
                    })?;
                }

                // write the avif bytes to a file
                let _ = std::fs::write(to, avif_bytes);

                let _ = std::fs::remove_file(&json_data.from);

                app.emit("job-success", self.id()).ok();

                let post_process_data = HashMap::from([
                    (
                        "type".to_string(),
                        "CompressAndSendPrescription".to_string(),
                    ),
                    ("filePath".to_string(), json_data.file_path),
                    ("fileName".to_string(), json_data.file_name),
                    ("from".to_string(), json_data.from),
                ]);
                // if the user is cloud, send the file to the server
                //* as the postgrest-rs crate doesn't contain Storage capabilities and that I'm afraid of using an unknown source package I'll send it through the official Supabase js package via a post-process tunnel
                app.emit("job-post-process", post_process_data).ok();
                Ok(())
            }
        }
    }

    pub fn id(&self) -> String {
        let data = match self {
            Job::TestSucceeded(data)
            | Job::TestFailed(data)
            | Job::TestPanic(data)
            | Job::CompressAndSendPrescription(data) => data,
        };
        data.get("id")
            .cloned()
            .unwrap_or_else(|| "unknown".to_string())
    }
}
