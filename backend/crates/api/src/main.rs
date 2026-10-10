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

    let max_conn: u32 = std::env::var("DATABASE_MAX_CONNECTIONS")
        .unwrap_or_else(|_| "20".to_string())
        .parse()
        .unwrap_or(20);

    let db_pool = match platform_db::create_supabase_db_pool(max_conn).await {
        Ok(pool) => {
            info!("Connected to primary Supabase PostgreSQL database pool.");
            Some(pool)
        }
        Err(e) => {
            tracing::warn!("Supabase/PostgreSQL pool not connected (using resilient fallback): {}", e);
            None
        }
    };

    let state = AppState {
        db_pool,
        start_time: Instant::now(),
    };

    let app = create_router(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("Platform Axum API Gateway listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
