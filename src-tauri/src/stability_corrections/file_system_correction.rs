use regex::Regex;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use tauri::Manager;

/// Extracts the UUID from a folder or file name using a regex pattern
fn extract_uuid(name: &str) -> Option<String> {
    let re = Regex::new(r"\(([\w-]+)\)$").unwrap();
    re.captures(name)
        .and_then(|caps| caps.get(1).map(|m| m.as_str().to_string()))
}

fn extract_uuid_and_extension(file_name: &str) -> Option<(String, String)> {
    let re = Regex::new(r"\(([\w-]+)\)(\.\w+)$").unwrap();
    re.captures(file_name).and_then(|caps| {
        Some((
            caps.get(1)?.as_str().to_string(), // Extract UUID
            caps.get(2)?.as_str().to_string(), // Extract file extension (e.g., ".pdf", ".png")
        ))
    })
}
/// Renames prescription PDFs to "${prescriptionUUID}.pdf"
fn rename_prescriptions(prescriptions_path: &Path) -> std::io::Result<()> {
    for entry in fs::read_dir(prescriptions_path)? {
        let entry = entry?;
        let old_path = entry.path();
        let file_name = old_path.file_name().unwrap().to_string_lossy().to_string();
        let file_stem = old_path.file_stem().unwrap().to_string_lossy().to_string();
        println!("\n\nthe prescriptions filestem : {:?}", file_stem);
        println!("\n\nthe prescriptions filename : {:?}", file_name);
        // Skip directories, process only files
        if old_path.is_file() {
            println!("in the file with : {:?}", old_path);
            if let Some(uuid) = extract_uuid(&file_stem) {
                let new_file_name = format!("{}.pdf", uuid);
                let new_path = prescriptions_path.join(new_file_name);
                fs::rename(&old_path, &new_path)?;
                println!("Renamed: {:?} -> {:?}", old_path, new_path);
            }
        }
    }
    Ok(())
}

/// Merges `prescriptions/` folders, ensuring only new prescriptions are moved
fn merge_prescriptions(src_prescriptions: &Path, dest_prescriptions: &Path) -> std::io::Result<()> {
    // Ensure destination folder exists
    if !dest_prescriptions.exists() {
        fs::create_dir_all(dest_prescriptions)?;
    }

    // Collect existing prescription UUIDs in the destination folder
    let mut existing_prescriptions: HashSet<String> = HashSet::new();
    if let Ok(entries) = fs::read_dir(dest_prescriptions) {
        for entry in entries {
            if let Ok(entry) = entry {
                if let Some((uuid, extension)) =
                    extract_uuid_and_extension(entry.file_name().to_string_lossy().as_ref())
                {
                    existing_prescriptions.insert(format!("{}{}", uuid, extension));
                }
            }
        }
    }
    println!("{:?}", existing_prescriptions);

    // Process source prescriptions
    if let Ok(entries) = fs::read_dir(src_prescriptions) {
        for entry in entries {
            let entry = entry?;
            let src_path = entry.path();
            let file_name = entry.file_name().to_string_lossy().to_string();

            // Only move if it's a new prescription
            if let Some((uuid, extension)) = extract_uuid_and_extension(&file_name) {
                let p_predicated_name = format!("{}{}", uuid, extension);
                println!(
                    "\n\nName of the predicated prescription : {}",
                    p_predicated_name
                );
                if !existing_prescriptions.contains(&p_predicated_name) {
                    let dest_path = dest_prescriptions.join(p_predicated_name);
                    fs::rename(&src_path, &dest_path)?;
                    println!("Moved new prescription: {:?}", dest_path);
                } else {
                    println!("Skipped duplicate prescription: {:?}", src_path);
                }
            }
        }
    }

    Ok(())
}

/// Merges `situation-pathologique-spDate(spUUID)` folders, ensuring only prescriptions are merged
fn merge_folders(src: &Path, dest: &Path) -> std::io::Result<()> {
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let src_sp_path = entry.path();

        if src_sp_path.is_dir() {
            let sp_folder_name = entry.file_name().to_string_lossy().to_string();
            let dest_sp_path = dest.join(&sp_folder_name);

            // Merge only prescriptions if `situation-pathologique-spDate(spUUID)` exists
            let src_prescriptions = src_sp_path.join("prescriptions");
            let dest_prescriptions = dest_sp_path.join("prescriptions");

            if src_prescriptions.exists() {
                merge_prescriptions(&src_prescriptions, &dest_prescriptions)?;
            }
        }
    }

    // Remove source folder after merge
    fs::remove_dir_all(src)?;
    Ok(())
}

/// Renames patient folders and performs cleanup of subdirectories
fn migrate_fs(base_path: &Path, migration_marker: &Path) -> std::io::Result<()> {
    if migration_marker.exists() {
        println!("Migration already completed.");
        return Ok(());
    }

    let mut seen_folders: HashMap<String, PathBuf> = HashMap::new();

    for entry in fs::read_dir(base_path)? {
        let entry = entry?;
        let user_folder = entry.path();

        if user_folder.is_dir() {
            for patient_entry in fs::read_dir(&user_folder)? {
                let patient_entry = patient_entry?;
                let old_patient_path = patient_entry.path();
                let patient_folder_name = patient_entry.file_name().to_string_lossy().to_string();
                println!("in patient folder: {:?}", patient_folder_name);

                if let Some(patient_uuid) = extract_uuid(&patient_folder_name) {
                    println!("the patient uuid ... {}", &patient_uuid);
                    let new_patient_folder_name = format!("patient{}", &patient_uuid);
                    let new_patient_path = user_folder.join(&new_patient_folder_name);

                    if let Some(existing) = seen_folders.get(&patient_uuid) {
                        println!("The name of the MERGING {}", &patient_uuid);
                        merge_folders(&old_patient_path, existing)?;
                    } else {
                        println!("just renaming {}", &patient_uuid);
                        fs::rename(&old_patient_path, &new_patient_path)?;

                        seen_folders.insert(patient_uuid, new_patient_path.clone());
                    }
                    for sp_entry in fs::read_dir(&new_patient_path)? {
                        let sp_entry = sp_entry?;
                        let dir_path = sp_entry.path();
                        println!("in sp folder: {:?}", dir_path);
                        if dir_path.is_file() {
                            continue;
                        }
                        // Delete 'factures' folder if it exists
                        let factures_path = dir_path.join("factures");
                        if factures_path.exists() {
                            println!("Deleting folder: {:?}", factures_path);
                            fs::remove_dir_all(&factures_path)?;
                            println!("Deleted folder: {:?}", factures_path);
                        }

                        // Process prescriptions folder
                        let prescriptions_path = dir_path.join("prescriptions");
                        if prescriptions_path.exists() {
                            rename_prescriptions(&prescriptions_path)?;
                        }
                        for sp_sub_entry in fs::read_dir(&dir_path)? {
                            let sp_sub_entry = sp_sub_entry?;
                            let dir_path = sp_sub_entry.path();
                            println!("in sp folder: {:?}", dir_path);
                            let file_name = match dir_path.file_stem() {
                                Some(f_n) => f_n.to_string_lossy().to_string(),
                                None => panic!(),
                            };
                            if dir_path.is_file() && file_name.starts_with("Annexe") {
                                fs::remove_file(&dir_path)?;
                                println!("Deleted Annexe file: {:?}", &dir_path);
                            }
                        }
                    }
                }
            }
        }
    }

    // Mark migration as done
    fs::File::create(migration_marker)?.write_all(b"done")?;
    println!("Migration completed.");
    Ok(())
}

pub fn perform_fs_stability_patch(app: &mut tauri::App) {
    let app_local_data_dir = match app.handle().path().app_local_data_dir() {
        Ok(path) => path,
        Err(_) => panic!(),
    };
    let migration_marker = app_local_data_dir.join(".fs_migration_done");

    if let Err(e) = migrate_fs(&app_local_data_dir, &migration_marker) {
        eprintln!("Error during migration: {}", e);
    }
}
