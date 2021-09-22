use actix_web::{
    Json,
    Result as ActixResult,
    HttpRequest,
    error::ErrorInternalServerError
};

use diesel::{
    self,
    prelude::*
};

use state::State;

#[derive(Deserialize)]
pub struct Order {
    pub order: Vec<i32>
}

pub fn change_order((order, req): (Json<Order>, HttpRequest<State>), table: &str) -> ActixResult<String> {
    let conn = &*req.state().db_conn()?;
    // is_admin(&req, conn)?;

    let mut values: String = String::new();

    // i - row order
    // j - row id
    for (i, j) in order.order.iter().enumerate() {
        let comma = if i == 0 {
            ""
        }
        else {
            ", "
        };

        values = format!("{}{}({}, {})", values, comma, j, i);
    }

    let query = format!(
        "
            UPDATE {}
            SET ord = vals.ord
            FROM (VALUES
                {}
            )
            AS vals(id, ord)
            WHERE {}.id = vals.id;
        ",
        table, values, table
    );

    diesel::sql_query(query).execute(conn).map_err(|err| {
        ErrorInternalServerError(err)
    })?;

    Ok(String::from("Success"))
}

