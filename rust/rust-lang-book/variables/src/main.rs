const REP_LYRICS: [&str; 12] = [
    "12 drummers drumming",
    "Eleven pipers piping",
    "Ten lords a-leaping",
    "Nine ladies dancing",
    "Eight maids a-milking",
    "Seven swans a-swimming",
    "Six geese a-laying",
    "Five golden rings (five golden rings)",
    "Four calling birds",
    "Three French hens",
    "Two turtle-doves",
    "And a partridge in a pear tree",
];

fn main() {
    for i in 1..8 {
        println!("{i} - {}", up_odd(i));
    }

    let freezing = convert_f_to_c(32.0);
    let room = convert_f_to_c(70.0);
    let body = convert_f_to_c(98.1);

    println!("freezing = {freezing}C");
    println!("room = {room}C");
    println!("body = {body}C");

    for i in 1..8 {
        println!("fib_n({i}) -> {}", fib_n(i))
    }

    println!("On the first day of Christmas");
    println!("My true love sent to me");
    println!("A partridge in a pear tree");

    for i in 1..12 {
        println!("");
        println!("On the first day of Christmas");
        println!("My true love sent to me");

        for j in 12 - i..12 {
            println!("{}", REP_LYRICS[j]);
        }
    }
    println!("And a partridge in a pear tree");
}

/*
 Add one to all odd input
*/
fn up_odd(x: i32) -> i32 {
    if x % 2 == 1 {
        x + 1
    } else {
        x
    }
}

fn convert_f_to_c(f: f32) -> f32 {
    (f - 32.0) * 5.0 / 9.0
}

fn fib_n(mut n: u32) -> u32 {
    let mut a = 1;
    let mut b = 1;
    loop {
        if n == 0 {
            break a;
        }
        n -= 1;
        let t = b;
        b = a + b;
        a = t;
    }
}
