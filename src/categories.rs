use actix_web::{
    Json,
    Result as ActixResult,
    HttpRequest,
    error:: ErrorInternalServerError
};

use diesel::{
    self,
    prelude::*
};

use models;
use state::State;
use auth::is_admin;
use order::{
    Order,
    change_order
};

pub fn get_categories(req: HttpRequest<State>) -> ActixResult<Json<Vec<models::Category>>> {
    use schema::categories::dsl::*;

    let conn = &*req.state().db_conn()?;

    let results = categories
        .load::<models::Category>(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    let mut json = Vec::<models::Category>::with_capacity(results.len());

    for category in results {
        json.push(models::Category {
            id: category.id,
            name: category.name,
            ord: category.ord
        });
    }

    Ok(Json(json))
}

#[derive(Deserialize)]
pub struct CategoryData {
    pub name: String,
}

pub fn add_category((category_data, req): (Json<CategoryData>, HttpRequest<State>)) -> ActixResult<String> {
    use schema::categories::dsl::*;

    let conn = &*req.state().db_conn()?;
    is_admin(&req, conn)?;

    diesel::insert_into(categories)
        .values(models::NewCategory {
            name: category_data.name.clone(),
            ord: 0
        })
        .execute(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    Ok(String::from("Success"))
}

pub fn edit_category((category_data, req): (Json<CategoryData>, HttpRequest<State>)) -> ActixResult<String> {
    use schema::categories::dsl::*;

    let conn = &*req.state().db_conn()?;
    is_admin(&req, conn)?;

    let category_id: i32 = req.match_info().query("category_id")?;

    diesel::update(categories.filter(id.eq(category_id)))
        .set(name.eq(&category_data.name))
        .execute(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    Ok(String::from("Success"))
}

pub fn delete_category(req: HttpRequest<State>) -> ActixResult<String> {
    use schema::categories::dsl::*;

    let conn = &*req.state().db_conn()?;
    is_admin(&req, conn)?;

    let category_id: i32 = req.match_info().query("category_id")?;

    diesel::delete(categories.filter(id.eq(category_id)))
        .execute(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    Ok(String::from("Success"))
}

pub fn change_categories_order((order, req): (Json<Order>, HttpRequest<State>)) -> ActixResult<String> {
    change_order((order, req), "categories")
}
