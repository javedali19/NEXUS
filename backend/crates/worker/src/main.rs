use platform_common::init_telemetry;
use platform_worker::{create_worker_router, run_outbox_polling_loop};
use std::net::SocketAddr;
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    init_telemetry();

    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "8081".to_string())
        .parse()
        .expect("PORT must be a valid u16 integer");

    // Spawn outbox polling loop in background tokio task
    tokio::spawn(async move {
        run_outbox_polling_loop().await;
    });

    let app = create_worker_router();
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("Platform Worker Service listening for Cloud Tasks on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
