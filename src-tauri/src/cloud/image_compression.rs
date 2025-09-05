use image::{codecs::avif::AvifEncoder, ImageEncoder};

pub fn tiff_to_avif(from: &str, to: &str, file_name: &str) -> Vec<u8> {
    let start_time = std::time::SystemTime::now();
    println!("Starting app at {:?}", start_time);
    print!("Decoding image");
    let img = image::open(from).unwrap();
    let resize_factor = img.height() / 1000;
    let resized = img.resize(
        img.width() / resize_factor,
        img.height() / resize_factor,
        image::imageops::FilterType::Triangle,
    );
    // let avif_path = format!("{}.avif", file_name);

    // Convert to RGBA8 for AVIF encoder
    print!("Converting to RGBA8");
    let rgba = resized.to_rgba8();
    let (width, height) = rgba.dimensions();

    // Prepare an in-memory buffer to hold AVIF bytes
    let mut buffer = Vec::new();
    let encoder = AvifEncoder::new(&mut buffer);

    // Encode
    print!("Encoding to AVIF");
    let _ = encoder
        .write_image(&rgba, width, height, image::ExtendedColorType::Rgba8)
        .map_err(|e| format!("Encode error: {e}"))
        .unwrap();

    print!("Writing to file");
    // let _ = std::fs::write(format!("{}/{}", to, avif_path), &buffer)
    // .map_err(|e| e.to_string())
    // .expect("Failed to write AVIF file");
    println!(
        "Done writing in {:?}",
        std::time::SystemTime::now()
            .duration_since(start_time)
            .unwrap()
    );
    buffer
}
