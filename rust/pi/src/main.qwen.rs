use rand::Rng;

fn main() {
    // Number of random points to generate (more = better approximation)
    let num_points: u32 = 10_000_000; // You can adjust this for more precision

    // Calculate Pi using Monte Carlo method
    let mut count_inside_circle = 0;
    let mut rng = rand::thread_rng();

    for _ in 0..num_points {
        let x: f64 = rng.gen_range(0.0, 1.0);
        let y: f64 = rng.gen_range(0.0, 1.0);

        if (x * x + y * y) < 1.0 {
            count_inside_circle += 1;
        }
    }

    // Calculate Pi
    let pi_estimate = 4.0 * (count_inside_circle as f64) / (num_points as f64);

    // Print Pi with the specified number of digits
    println!("Estimate of Pi: {:.10}", pi_estimate);
}
