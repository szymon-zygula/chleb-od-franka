use r2d2::{self, Pool, PooledConnection};
use diesel::{
    r2d2::ConnectionManager,
    pg::PgConnection,
};
use actix_web::{
    Result as ActixResult,
    error::{
        ErrorInternalServerError
    }
};

pub struct State {
    pub pool: Pool<ConnectionManager<PgConnection>>
}

impl State {
    pub fn db_conn(&self) -> ActixResult<PooledConnection<ConnectionManager<PgConnection>>> {
        self.pool.get().map_err(|err: r2d2::Error| {
            ErrorInternalServerError(err)
        })
    }
}

impl Clone for State {
    fn clone(&self) -> State {
        State {
            pool: self.pool.clone()
        }
    }
}

