use std::env;

use std::fs::File;
use std::io::{self,BufRead,BufReader,Result,Lines};
use std::path::Path;

fn main() {
    let args: Vec<String> = env::args().collect();
    let path1 = &args[1];
    let path2 = &args[2];
    
    if let (Ok(lines1), Ok(lines2)) = (read_lines(path1), read_lines(path2)) {
        for (line1, line2) in lines1.zip(lines2) {
            if let (Ok(one), Ok(two)) = (line1, line2) {
                if let(Ok(one_int), Ok(two_int)) = (one.parse::<i32>(), two.parse::<i32>()) {
                    println!("{}", one_int + two_int )
                } else {
                    println!("Unable to add {}<from: {}> + {}<from: {}>", one, path1, two, path2);
                }
            }
        }
    } else {
        println!("Unable to open both files: {} or {}", path1, path2)
    }
}

fn read_lines<P>(path: P) -> Result<Lines<BufReader<File>>>
where P: AsRef<Path>, {
    let file = File::open(path)?;
    Ok(io::BufReader::new(file).lines())
}