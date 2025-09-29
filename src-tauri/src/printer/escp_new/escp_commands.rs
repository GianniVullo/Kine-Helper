/// ESC/P command generation module
/// Handles low-level printer commands and protocol details

/// Printer resolution modes for 24-pin printers
#[derive(Clone, Debug, PartialEq)]
pub enum PrinterResolution {
    Low,  // 180 DPI (ESC/P standard)
    High, // 360 DPI (ESC/P2)
}

/// Printer model variants with specific configurations
#[derive(Clone, Debug, PartialEq)]
pub enum PrinterModel {
    Generic9Pin,
    Generic24Pin,
    EpsonLQ,      // Epson LQ series (24-pin)
    EpsonFX,      // Epson FX series (9-pin)
    OkiMicroline, // OKI printers (often need different spacing)
    Panasonic,    // Panasonic KX-P series
}

/// Printer type configuration
#[derive(Clone, Debug)]
pub struct PrinterConfig {
    pub is_nine_pin: bool,
    pub dots_per_mm_vertical: f64,
    pub dots_per_mm_horizontal: f64,
    pub model: PrinterModel,
    pub resolution: Option<PrinterResolution>,
    pub needs_initialization: bool,
}

impl PrinterConfig {
    /// Configuration for 9-pin printers
    pub fn nine_pin() -> Self {
        Self {
            is_nine_pin: true,
            dots_per_mm_vertical: 3.0, // 72 DPI = ~2.83 dots/mm
            dots_per_mm_horizontal: 3.0,
            model: PrinterModel::Generic9Pin,
            resolution: None,
            needs_initialization: false,
        }
    }

    /// Configuration for 24-pin printers (with initialization by default!)
    pub fn twenty_four_pin() -> Self {
        Self {
            is_nine_pin: false,
            dots_per_mm_vertical: 7.1, // 180 DPI
            dots_per_mm_horizontal: 7.1,
            model: PrinterModel::Generic24Pin,
            resolution: Some(PrinterResolution::Low),
            needs_initialization: true, // DEFAULT TO TRUE for 24-pin!
        }
    }

    /// Epson LQ series configuration
    pub fn epson_lq() -> Self {
        Self {
            is_nine_pin: false,
            dots_per_mm_vertical: 7.1, // 180 DPI default
            dots_per_mm_horizontal: 7.1,
            model: PrinterModel::EpsonLQ,
            resolution: Some(PrinterResolution::Low),
            needs_initialization: true,
        }
    }

    /// OKI Microline configuration (often needs different spacing)
    pub fn oki_microline() -> Self {
        Self {
            is_nine_pin: false,
            dots_per_mm_vertical: 7.1,
            dots_per_mm_horizontal: 7.1,
            model: PrinterModel::OkiMicroline,
            resolution: Some(PrinterResolution::Low),
            needs_initialization: true,
        }
    }

    /// Panasonic KX-P series configuration
    pub fn panasonic() -> Self {
        Self {
            is_nine_pin: false,
            dots_per_mm_vertical: 7.1,
            dots_per_mm_horizontal: 7.1,
            model: PrinterModel::Panasonic,
            resolution: Some(PrinterResolution::Low),
            needs_initialization: true,
        }
    }

    /// Epson FX series (9-pin) configuration
    pub fn epson_fx() -> Self {
        Self {
            is_nine_pin: true,
            dots_per_mm_vertical: 3.0,
            dots_per_mm_horizontal: 3.0,
            model: PrinterModel::EpsonFX,
            resolution: None,
            needs_initialization: false,
        }
    }
}

/// ESC/P command builder for printer operations
pub struct EscpCommandBuilder {
    config: PrinterConfig,
}

impl EscpCommandBuilder {
    /// Create a new command builder with the given configuration
    pub fn new(config: PrinterConfig) -> Self {
        Self { config }
    }

    /// Get whether this is a 9-pin printer (public access)
    pub fn is_nine_pin(&self) -> bool {
        self.config.is_nine_pin
    }

    /// Get the printer model (public access)
    pub fn get_model(&self) -> &PrinterModel {
        &self.config.model
    }

    /// Get the full configuration (public access)
    pub fn get_config(&self) -> &PrinterConfig {
        &self.config
    }

    /// Initialize printer to known state
    /// This is crucial for 24-pin printers to ensure consistent output
    pub fn initialize_printer(&self) -> Vec<u8> {
        let mut commands = vec![];

        // Reset printer to default state
        commands.extend_from_slice(&[0x1b, 0x40]); // ESC @ - Initialize printer

        if !self.config.is_nine_pin {
            // For 24-pin printers, set specific modes to ensure consistency

            // ESC x 1 - Select NLQ (Near Letter Quality) mode for consistent quality
            commands.extend_from_slice(&self.set_print_quality(true));

            // ESC k 0 - Select Roman font (most standard)
            commands.extend_from_slice(&self.select_font(0));

            // ESC p 0 - Disable proportional spacing (critical for alignment!)
            commands.extend_from_slice(&[0x1b, 0x70, 0x00]);

            // ESC 3 n - Set line spacing to n/180 inch (24-pin standard)
            // 24/180 = ~3.4mm line spacing
            commands.extend_from_slice(&self.set_graphics_mode());

            // ESC U 0 - Turn off unidirectional printing (for speed)
            // Use ESC U 1 if alignment issues occur
            commands.extend_from_slice(&[0x1b, 0x55, 0x00]);

            // Model-specific initialization
            match self.config.model {
                PrinterModel::OkiMicroline => {
                    // OKI printers sometimes need extra setup
                    // ESC 6 - Enable printing of upper control codes
                    commands.extend_from_slice(&[0x1b, 0x36]);
                }
                PrinterModel::Panasonic => {
                    // Panasonic might need different line spacing
                    commands.extend_from_slice(&[0x1b, 0x33, 30]); // Slightly more spacing
                }
                _ => {}
            }
        }

        // ESC 6 - Enable printing of characters in the range 128-159
        commands.extend_from_slice(&[0x1b, 0x36]);

        commands
    }

    /// Set graphics/line spacing mode for consistent vertical spacing
    pub fn set_graphics_mode(&self) -> Vec<u8> {
        if self.config.is_nine_pin {
            // ESC A n - Set line spacing to n/72 inch for 9-pin
            vec![0x1b, 0x41, 12] // 12/72 = 1/6 inch
        } else {
            // For 24-pin, use appropriate mode based on resolution
            match self.config.resolution {
                Some(PrinterResolution::High) => {
                    // ESC + n - Set line spacing to n/360 inch for high res
                    vec![0x1b, 0x2b, 40] // 40/360 = ~2.8mm
                }
                _ => {
                    // ESC 3 n - Set line spacing to n/180 inch for standard
                    vec![0x1b, 0x33, 24] // 24/180 = ~3.4mm
                }
            }
        }
    }

    /// Set form length to 12 inches
    pub fn set_form_length_12_inch(&self) -> Vec<u8> {
        vec![0x1b, 0x43, 0x00, 0x0c]
    }

    /// Form feed command
    pub fn form_feed(&self) -> Vec<u8> {
        vec![0x0c]
    }

    /// Set character pitch to 10 CPI (characters per inch)
    pub fn set_10_cpi(&self) -> Vec<u8> {
        vec![0x1b, 0x50]
    }

    /// Set character pitch to 12 CPI (characters per inch)
    pub fn set_12_cpi(&self) -> Vec<u8> {
        vec![0x1b, 0x4d]
    }

    /// Select font for 24-pin printers
    /// font_id: 0 = Roman, 1 = Sans-serif, 2 = Courier, 3 = Prestige, 4 = Script
    pub fn select_font(&self, font_id: u8) -> Vec<u8> {
        if !self.config.is_nine_pin {
            // ESC k n - Select typeface
            vec![0x1b, 0x6b, font_id]
        } else {
            vec![]
        }
    }

    /// Set draft or NLQ mode (24-pin only)
    pub fn set_print_quality(&self, nlq: bool) -> Vec<u8> {
        if !self.config.is_nine_pin {
            if nlq {
                // ESC x 1 - Select NLQ mode
                vec![0x1b, 0x78, 0x01]
            } else {
                // ESC x 0 - Select draft mode
                vec![0x1b, 0x78, 0x00]
            }
        } else {
            vec![]
        }
    }

    /// Ensure consistent character width (disable proportional spacing)
    pub fn set_fixed_pitch(&self) -> Vec<u8> {
        // ESC p 0 - Turn off proportional mode
        vec![0x1b, 0x70, 0x00]
    }

    /// Generate vertical spacing command in millimeters
    /// Uses appropriate spacing command based on printer type and model
    pub fn vertical_spacing_mm(&self, mm: f64) -> Vec<u8> {
        match self.config.model {
            PrinterModel::Generic9Pin | PrinterModel::EpsonFX => {
                // Use ESC J for 9-pin (n/216 inch)
                let dots = (mm * self.config.dots_per_mm_vertical).round() as u8;
                vec![0x1b, 0x4a, dots]
            }
            PrinterModel::Generic24Pin | PrinterModel::EpsonLQ => {
                // For 24-pin, use ESC + for better accuracy (n/360 inch) if small enough
                let inches = mm / 25.4;
                let dots_360 = (inches * 360.0).round() as u16;
                if dots_360 <= 255 {
                    vec![0x1b, 0x2b, dots_360 as u8]
                } else {
                    // Fall back to ESC J for larger values
                    let dots = (mm * self.config.dots_per_mm_vertical).round() as u8;
                    vec![0x1b, 0x4a, dots]
                }
            }
            PrinterModel::OkiMicroline | PrinterModel::Panasonic => {
                // These often work better with ESC 3 n (set n/180" line spacing)
                // followed by line feed
                let inches = mm / 25.4;
                let dots_180 = (inches * 180.0).round() as u8;
                vec![
                    0x1b, 0x33, dots_180, // Set line spacing
                    0x0a,     // Line feed
                    0x1b, 0x32, // Reset to default spacing
                ]
            }
        }
    }

    /// Generate vertical spacing command in dots
    /// Handles values > 255 by chaining multiple commands
    pub fn vertical_spacing_dots(&self, dots: u16) -> Vec<u8> {
        let mut commands = Vec::new();
        let mut remaining = dots;

        // For 24-pin printers in high resolution mode
        if !self.config.is_nine_pin && self.config.resolution == Some(PrinterResolution::High) {
            // Use ESC + for 360 DPI mode
            while remaining > 255 {
                commands.extend_from_slice(&[0x1b, 0x2b, 255]);
                remaining -= 255;
            }
            if remaining > 0 {
                commands.extend_from_slice(&[0x1b, 0x2b, remaining as u8]);
            }
        } else {
            // Standard ESC J command
            while remaining > 255 {
                commands.extend_from_slice(&[0x1b, 0x4a, 255]);
                remaining -= 255;
            }
            if remaining > 0 {
                commands.extend_from_slice(&[0x1b, 0x4a, remaining as u8]);
            }
        }

        commands
    }

    /// Convert text to bytes with carriage return and tabs
    pub fn text_line(text: &str, tabs: usize) -> Vec<u8> {
        let mut line = String::from("\r");
        for _ in 0..tabs {
            line.push('\t');
        }
        line.push_str(text);
        line.into_bytes()
    }

    /// Build a complete binary stream from command vectors
    pub fn build_binary(command_vectors: Vec<Vec<u8>>) -> Vec<u8> {
        command_vectors.into_iter().flatten().collect()
    }

    /// Generate a test/calibration page to diagnose spacing issues
    pub fn generate_calibration_page(&self) -> Vec<u8> {
        let mut commands = vec![];

        // Initialize printer
        commands.extend(self.initialize_printer());
        commands.extend(self.set_form_length_12_inch());

        // Print header
        commands.extend(b"\rPrinter Calibration Page\r\n".to_vec());
        commands.extend(format!("\rModel: {:?}\r\n", self.config.model).into_bytes());
        commands.extend(
            format!("\rDots/mm (V): {}\r\n", self.config.dots_per_mm_vertical).into_bytes(),
        );
        commands.extend(
            format!("\rInitialization: {}\r\n", self.config.needs_initialization).into_bytes(),
        );
        commands.extend(b"\r\n".to_vec());

        // Test different spacing values
        commands.extend(b"\rTesting vertical spacing (should be 10mm gaps):\r\n".to_vec());
        for i in 1..=5 {
            commands.extend(format!("\rLine {}", i).into_bytes());
            commands.extend(self.vertical_spacing_mm(10.0));
        }

        // Test CPI settings
        commands.extend(b"\r\nTesting character pitch:\r\n".to_vec());
        commands.extend(self.set_10_cpi());
        commands.extend(b"\r10 CPI: XXXXXXXXXX\r\n".to_vec());
        commands.extend(self.set_12_cpi());
        commands.extend(b"\r12 CPI: XXXXXXXXXXXX\r\n".to_vec());

        // Test fonts (24-pin only)
        if !self.config.is_nine_pin {
            commands.extend(b"\r\nTesting fonts:\r\n".to_vec());
            commands.extend(self.select_font(0));
            commands.extend(b"\rRoman: ABCDEFGHIJKLM 123456\r\n".to_vec());
            commands.extend(self.select_font(1));
            commands.extend(b"\rSans-serif: ABCDEFGHIJKLM 123456\r\n".to_vec());

            // Test print quality
            commands.extend(b"\r\nTesting print quality:\r\n".to_vec());
            commands.extend(self.set_print_quality(false));
            commands.extend(b"\rDraft mode: ABCDEFGHIJKLM\r\n".to_vec());
            commands.extend(self.set_print_quality(true));
            commands.extend(b"\rNLQ mode: ABCDEFGHIJKLM\r\n".to_vec());
        }

        // Test grid for alignment
        commands.extend(b"\r\nAlignment grid:\r\n".to_vec());
        for _ in 0..5 {
            commands.extend(b"\r+----+----+----+----+----+\r\n".to_vec());
            commands.extend(b"\r|    |    |    |    |    |\r\n".to_vec());
        }
        commands.extend(b"\r+----+----+----+----+----+\r\n".to_vec());

        commands.extend(self.form_feed());
        commands
    }
}

/// Spacing configuration for form sections
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct FormSpacing {
    pub initial_spacing: u16,
    pub spacing_scale: f64,

    // Identification section (5 values)
    pub id_name_to_mutuality: u16,
    pub id_mutuality_to_niss: u16,
    pub id_niss_to_address: u16,
    pub id_address_to_postal: u16,
    pub id_postal_to_next: u16,

    // Prestations section (11 values)
    pub prest_name_to_table: u16,
    pub prest_lines: [u16; 10],

    // Prescription section (9 values)
    pub presc_spacing: [u16; 9],

    // Signature section (2 values)
    pub sign_total_to_name: u16,
    pub sign_internal: u16,

    // Fixed spacings
    pub sign_name_line_spacing: u16,
    pub sign_after_location: u16,
    pub remb_to_bce: u16,
    pub remb_bce_to_date: u16,
    pub remb_date_to_total: u16,
}

impl FormSpacing {
    /// Get default spacing for 9-pin printer
    pub fn nine_pin_default() -> Self {
        Self {
            // Starter Values
            initial_spacing: 59,
            spacing_scale: 1.0,

            // Identification section
            id_name_to_mutuality: 108,
            id_mutuality_to_niss: 46,
            id_niss_to_address: 62,
            id_address_to_postal: 46,
            id_postal_to_next: 141,

            // Prestations section
            prest_name_to_table: 396,
            prest_lines: [36, 35, 36, 35, 36, 37, 35, 36, 35, 39],

            // Prescription section
            presc_spacing: [33, 37, 37, 33, 100, 29, 21, 29, 31],

            // Signature section
            sign_total_to_name: 112,
            sign_internal: 37,

            // Fixed spacings
            sign_name_line_spacing: 37,
            sign_after_location: 120,
            remb_to_bce: 79,
            remb_bce_to_date: 87,
            remb_date_to_total: 87,
        }
    }

    /// Get default spacing for 24-pin printer
    pub fn twenty_four_pin_default() -> Self {
        Self {
            // Starter Values
            initial_spacing: 59,
            spacing_scale: 1.0,

            // Identification section
            id_name_to_mutuality: 108,
            id_mutuality_to_niss: 46,
            id_niss_to_address: 62,
            id_address_to_postal: 46,
            id_postal_to_next: 141,

            // Prestations section
            prest_name_to_table: 396,
            prest_lines: [36, 35, 36, 35, 36, 37, 35, 36, 35, 39],

            // Prescription section
            presc_spacing: [33, 37, 37, 33, 100, 29, 21, 29, 31],

            // Signature section
            sign_total_to_name: 112,
            sign_internal: 37,

            // Fixed spacings
            sign_name_line_spacing: 37,
            sign_after_location: 120,
            remb_to_bce: 79,
            remb_bce_to_date: 87,
            remb_date_to_total: 87,
        }
    }

    /// Get spacing configuration for specific printer models
    pub fn for_model(model: &PrinterModel) -> Self {
        match model {
            PrinterModel::OkiMicroline => {
                let mut spacing = Self::twenty_four_pin_default();
                // OKI printers often need slightly different vertical spacing
                spacing.prest_lines = [38, 37, 38, 37, 38, 39, 37, 38, 37, 41];
                spacing.id_name_to_mutuality = 110;
                spacing
            }
            PrinterModel::EpsonLQ => {
                // Epson LQ series usually work well with defaults
                Self::twenty_four_pin_default()
            }
            PrinterModel::Panasonic => {
                let mut spacing = Self::twenty_four_pin_default();
                // Panasonic printers might need adjustment
                spacing.id_name_to_mutuality = 110;
                spacing.prest_name_to_table = 400;
                spacing.prest_lines = [37, 36, 37, 36, 37, 38, 36, 37, 36, 40];
                spacing
            }
            PrinterModel::Generic9Pin | PrinterModel::EpsonFX => Self::nine_pin_default(),
            PrinterModel::Generic24Pin => Self::twenty_four_pin_default(),
        }
    }

    /// Create custom spacing with a scaling factor
    pub fn with_scale(&self, factor: f64) -> Self {
        Self {
            // Starter Values
            initial_spacing: 59,
            spacing_scale: factor,

            id_name_to_mutuality: (self.id_name_to_mutuality as f64 * factor).round() as u16,
            id_mutuality_to_niss: (self.id_mutuality_to_niss as f64 * factor).round() as u16,
            id_niss_to_address: (self.id_niss_to_address as f64 * factor).round() as u16,
            id_address_to_postal: (self.id_address_to_postal as f64 * factor).round() as u16,
            id_postal_to_next: (self.id_postal_to_next as f64 * factor).round() as u16,
            prest_name_to_table: (self.prest_name_to_table as f64 * factor).round() as u16,
            prest_lines: [
                (self.prest_lines[0] as f64 * factor).round() as u16,
                (self.prest_lines[1] as f64 * factor).round() as u16,
                (self.prest_lines[2] as f64 * factor).round() as u16,
                (self.prest_lines[3] as f64 * factor).round() as u16,
                (self.prest_lines[4] as f64 * factor).round() as u16,
                (self.prest_lines[5] as f64 * factor).round() as u16,
                (self.prest_lines[6] as f64 * factor).round() as u16,
                (self.prest_lines[7] as f64 * factor).round() as u16,
                (self.prest_lines[8] as f64 * factor).round() as u16,
                (self.prest_lines[9] as f64 * factor).round() as u16,
            ],
            presc_spacing: [
                (self.presc_spacing[0] as f64 * factor).round() as u16,
                (self.presc_spacing[1] as f64 * factor).round() as u16,
                (self.presc_spacing[2] as f64 * factor).round() as u16,
                (self.presc_spacing[3] as f64 * factor).round() as u16,
                (self.presc_spacing[4] as f64 * factor).round() as u16,
                (self.presc_spacing[5] as f64 * factor).round() as u16,
                (self.presc_spacing[6] as f64 * factor).round() as u16,
                (self.presc_spacing[7] as f64 * factor).round() as u16,
                (self.presc_spacing[8] as f64 * factor).round() as u16,
            ],
            sign_total_to_name: (self.sign_total_to_name as f64 * factor).round() as u16,
            sign_internal: (self.sign_internal as f64 * factor).round() as u16,
            sign_name_line_spacing: (self.sign_name_line_spacing as f64 * factor).round() as u16,
            sign_after_location: (self.sign_after_location as f64 * factor).round() as u16,
            remb_to_bce: (self.remb_to_bce as f64 * factor).round() as u16,
            remb_bce_to_date: (self.remb_bce_to_date as f64 * factor).round() as u16,
            remb_date_to_total: (self.remb_date_to_total as f64 * factor).round() as u16,
        }
    }
}
