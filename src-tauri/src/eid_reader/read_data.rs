use super::eid_reader_resources::{CommandAPDU, FileType, ResponseAPDU};

//* read_file permet de :
//*     - Sélectionner un fichier à lire sur la carte d'identité
//*     - Lire le fichier binaire
//* Pour cela il faut, à chaque fois :
//*     - Définir la taille de la réponse
//*     - Créer un buffer pour recevoir la réponse
//*     - Appeler la commande de séléction de fichier
//*     - Réitérer les étapes 1 et 2
//*     - Appeler la commande de lecture de fichier

pub fn read_file(card: &pcsc::Card, file_type: FileType) -> Result<Vec<u8>, String> {
    print!("Int the readfile fn");
    //* Sélection de la fonctionnalité de la eid
    let mut select_response_buffer = get_buffer(pcsc::MAX_BUFFER_SIZE);
    let select_cmd = &file_type.get_full_command();
    println!("\nThe select CMD = {:?}", select_cmd);
    let _select_file_response = match card.transmit(&select_cmd, &mut select_response_buffer) {
        Ok(rapdu) => rapdu,
        Err(_err) => return Err("Cannot select file from ID CARD".to_string()),
    };
    println!("\nThe select statement {:?}", select_response_buffer);
    let mut read_response_buffer: [u8; 264] = [0; pcsc::MAX_BUFFER_SIZE];
    let read_command_header = CommandAPDU::read_binary().get_cmd();
    let mut final_bytes_response: Vec<u8> = vec![];
    let mut data: Vec<u8> = vec![];
    let mut offset: u16 = 0;
    let mut read_length = 0xFF; //* on commence par le max, comme ça il nous dis de suite -Non, mais passke c pas la bonne length enfait fréro- -c sa la bonne length-
    loop {
        let read_command = vec![
            read_command_header[0],
            read_command_header[1],
            (offset >> 8).try_into().unwrap(),
            (offset & 255).try_into().unwrap(),
            read_length,
        ];
        println!("\nThe read command : {:?}", read_command);
        let response: ResponseAPDU = match card.transmit(&read_command, &mut read_response_buffer) {
            Ok(data) => ResponseAPDU::new(data),
            Err(_err) => return Err("APDU Command read_binary failed :/".to_string()),
        };
        // println!("\nThe read response : {:?}", response.apdu);
        let sw = response.get_sw();
        if (sw & 0xFF00) == 0x6C00 {
            read_length = (sw & 0xFF) as u8;
            println!(
                "Resending read command with correct length: {}",
                read_length
            );
            continue;
        }
        if 27392 == sw {
            //* ça veut dire que le p1 et/ou le p2 est invalide donc la commande est à côté de ses pompes et ça plante.
            // break;
            return Err("Oops".to_string());
        }
        if 36864 != sw {
            return Err("Unknown error while sendin read binary command to smartcard".to_string());
        }

        data = response.get_data(); // la réponse moins le SW (2 octets)

        // Ici on jarte les zéros superflu du buffer
        print!(
            "Jartage des zéros en trop data.len = {} read_lenght = {} \n\n the data = {:?}\n\n",
            data.len(),
            read_length,
            data
        );
        if data.len() > read_length as usize {
            data.truncate(read_length as usize);
            print!("data after truncation = {:?}", data);
        }

        final_bytes_response.extend_from_slice(&data);
        offset += data.len() as u16;
        if data.len() < 255 {
            break;
        }
    }
    println!(
        "Final byte response for {:?} = {:?}",
        file_type, final_bytes_response
    );
    Ok(final_bytes_response)
}

pub fn get_atr(card: &pcsc::Card) -> Result<Vec<u8>, String> {
    let (name_size, atr_size) = match card.status2_len() {
        Ok(sizes) => sizes,
        Err(_err) => panic!(),
    };
    let mut names_buffer: Vec<u8> = get_buffer(name_size);
    let mut atr_buffer: Vec<u8> = get_buffer(atr_size);

    let atr: Vec<u8> = match card.status2(&mut names_buffer, &mut atr_buffer) {
        Ok(card_status) => card_status.atr().to_vec(),
        Err(_err) => return Err("Cannot find ATR".to_string()),
    };
    Ok(atr)
}

fn get_buffer(length: usize) -> Vec<u8> {
    let mut buffer = vec![];
    for _ in 0..length {
        buffer.push(0);
    }
    buffer
}

fn get_paramater_length(card: &pcsc::Card) -> u8 {
    let read_command_with_length_zero = b"\x00\xB0\x00\x00\x00";

    let mut read_length_apdu_buf = [0; pcsc::MAX_BUFFER_SIZE];

    match card.transmit(read_command_with_length_zero, &mut read_length_apdu_buf) {
        Ok(length) => length[1],
        Err(_err) => 0 as u8,
    }
}
