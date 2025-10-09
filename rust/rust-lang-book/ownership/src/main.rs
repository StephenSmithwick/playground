fn main() {
    let mut s = String::from("hello");

    let r1 = &s;
    s.push_str(" world");

    let r2 = &s;

    println!("{}, {}", r2, s);
}
