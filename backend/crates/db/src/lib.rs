use platform_common::{PlatformError, TenantContext};
use sqlx::postgres::PgPoolOptions;
use sqlx::{PgPool, Transaction};
use std::time::Duration;
use tracing::info;

pub type DbPool = PgPool;

pub async fn create_db_pool(database_url: &str, max_connections: u32) -> Result<DbPool, PlatformError> {
    info!("Initializing PostgreSQL connection pool...");
    let pool = PgPoolOptions::new()
        .max_connections(max_connections)
        .acquire_timeout(Duration::from_secs(5))
        .connect(database_url)
        .await
        .map_err(|e| PlatformError::DatabaseError(e.to_string()))?;

    Ok(pool)
}

/// Executes a database transaction with PostgreSQL Row Level Security (RLS) tenant isolation.
/// Sets `app.current_tenant_id` for the transaction session before yields.
pub async fn with_tenant_tx<'a, F, T, E>(
    pool: &'a DbPool,
    context: &TenantContext,
    f: F,
) -> Result<T, PlatformError>
where
    F: for<'c> FnOnce(&'c mut Transaction<'a, sqlx::Postgres>) -> futures::future::BoxFuture<'c, Result<T, E>>,
    E: std::fmt::Display,
{
    let mut tx = pool
        .begin()
        .await
        .map_err(|e| PlatformError::DatabaseError(e.to_string()))?;

    // Enforce PostgreSQL RLS session context
    let set_tenant_query = format!("SET LOCAL app.current_tenant_id = '{}';", context.tenant_id);
    sqlx::query(&set_tenant_query)
        .execute(&mut *tx)
        .await
        .map_err(|e| PlatformError::DatabaseError(format!("Failed to set RLS tenant context: {}", e)))?;

    let result = f(&mut tx)
        .await
        .map_err(|e| PlatformError::DatabaseError(e.to_string()))?;

    tx.commit()
        .await
        .map_err(|e| PlatformError::DatabaseError(e.to_string()))?;

    Ok(result)
}
