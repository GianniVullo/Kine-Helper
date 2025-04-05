use pcsc::*;
use std::time;

pub fn get_card() -> Result<pcsc::Card, String> {
    // Establish a PC/SC context.
    let ctx = match Context::establish(Scope::User) {
        Ok(ctx) => ctx,
        Err(err) => {
            return Err(format!("Failed to establish context: {}", err));
        }
    };

    // List available readers.
    let mut readers_buf = [0; 2048];
    let mut readers = match ctx.list_readers(&mut readers_buf) {
        Ok(readers) => readers,
        Err(err) => {
            return Err(format!("Failed to list readers: {}", err));
        }
    };
    // println!("Readers = {:#?}", readers);

    // Use the first reader.
    let reader = match readers.next() {
        Some(reader) => reader,
        None => {
            println!("No readers are connected.");
            return Err("No readers are connected.".to_string());
        }
    };
    println!("Using reader: {:?}", reader);

    if reader.is_empty() {
        println!("No readers are connected.");
        return Err("No readers are connected.".to_string());
    }

    let mut card_state = [ReaderState::new(reader, State::UNAWARE)];

    let mut loop_count = 0;
    loop {
        loop_count += 1;

        let _blocking_untill_card_detected =
            ctx.get_status_change(time::Duration::from_secs(3), &mut card_state);

        if card_state[0].event_state().contains(State::PRESENT) {
            println!("Card detected!");

            let card = match ctx.connect(reader, ShareMode::Shared, Protocols::ANY) {
                Ok(card) => card,
                Err(pcsc::Error::NoSmartcard) => {
                    println!("A smartcard is not present in the reader.");
                    return Err("A smartcard is not present in the reader.".to_string());
                }
                Err(err) => {
                    return Err(format!("Failed to connect to card: {}", err));
                }
            };
            return Ok(card);
        }
        if loop_count > 32 {
            return Err("Cannot connect to Card".to_string());
        }
        {}
    }
}
