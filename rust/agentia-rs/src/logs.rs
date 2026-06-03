use std::fs::{OpenOptions, create_dir_all};
use std::io::Write;
use std::path::PathBuf;

use serde::Serialize;

fn log_dir() -> PathBuf {
    let mut p = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    p.push("logs");
    p
}

pub fn log_json_line<T: Serialize>(filename: &str, value: &T) {
    let dir = log_dir();
    if create_dir_all(&dir).is_err() {
        return;
    }

    let mut path = dir;
    path.push(filename);

    let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) else {
        return;
    };

    let Ok(line) = serde_json::to_string(value) else {
        return;
    };

    let _ = writeln!(file, "{line}");
}
