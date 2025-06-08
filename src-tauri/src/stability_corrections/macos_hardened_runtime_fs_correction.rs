use std::fs;

pub fn migrate_old_data_if_needed() -> std::io::Result<()> {
    // Get the sandboxed data path (inside container)
    let sandboxed_path = dirs::data_local_dir()
        .map(|p| p.join("be.kine-helper.prod"))
        .expect("Cannot resolve sandboxed local data path");
    println!("Sandboxed data path: {:?}", sandboxed_path);

    // Only proceed if sandboxed folder is missing or empty, and old data exists
    let sandboxed_exists =
        sandboxed_path.exists() && fs::read_dir(&sandboxed_path)?.next().is_some();

    if !sandboxed_exists {
        println!("📦 creating from {:?}", sandboxed_path);

        std::fs::create_dir_all(&sandboxed_path)?;
        println!("✅ Migration complete.");
    }

    Ok(())
}
