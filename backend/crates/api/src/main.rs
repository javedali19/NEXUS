use platform_api::{create_router, AppState};
use platform_common::init_telemetry;
use std::net::SocketAddr;
use std::time::Instant;
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    init_telemetry();

    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .expect("PORT must be a valid u16 integer");

    let state = AppState {
        db_pool: None,
        start_time: Instant::now(),
    };

    let app = create_router(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("Platform Axum API Gateway listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
