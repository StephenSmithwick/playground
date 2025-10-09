use smol::{Async, prelude::*};
use std::net::{TcpStream, ToSocketAddrs};

use anyhow::{Context as _, Result, bail};
use url::Url;

/// Sends a POST request and fetches the response.
async fn post(addr: &str, data: &str) -> Result<Vec<u8>> {
    // Parse the URL.
    let url = Url::parse(addr)?;
    let host = url.host().context("cannot parse host")?.to_string();
    let port = url.port_or_known_default().context("cannot guess port")?;
    let path = url.path().to_string();
    let query = match url.query() {
        Some(q) => format!("?{}", q),
        None => String::new(),
    };

    // Construct a request.
    let req = format!(
        "POST {}{} HTTP/1.1\r\nHost: {}:{}\r\nAccept: */*\r\nContent-Length: {}\r\n\r\n{}\r\nConnection: close\r\n\r\n",
        path,
        query,
        host,
        port,
        data.len(),
        data
    );

    println!("req: {}", req);
    println!("host: {}", host);
    println!("port: {}", port);

    // Connect to the host.
    let socket_addr = {
        let host = host.clone();
        smol::unblock(move || (host.as_str(), port).to_socket_addrs())
            .await?
            .next()
            .context("cannot resolve address")?
    };
    let mut stream = Async::<TcpStream>::connect(socket_addr).await?;

    // Send the request and wait for the response.
    let mut resp = Vec::new();
    match url.scheme() {
        "http" => {
            stream.write_all(req.as_bytes()).await?;
            stream.read_to_end(&mut resp).await?;
        }
        "https" => {
            // In case of HTTPS, establish a secure TLS connection first.
            let mut stream = async_native_tls::connect(&host, stream).await?;
            stream.write_all(req.as_bytes()).await?;
            stream.read_to_end(&mut resp).await?;
        }
        scheme => bail!("unsupported scheme: {}", scheme),
    }

    Ok(resp)
}

fn main() -> Result<()> {
    smol::block_on(async {
        let addr = "http://127.0.0.1:8080/v1/chat/completions";
        let data =
            r#"{ "messages": [{"role":"user", "content":"Why is the sky blue?"}], "stream":true }"#;
        let resp = post(addr, data).await?;
        println!("{}", String::from_utf8_lossy(&resp));
        Ok(())
    })
}
