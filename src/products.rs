use base64;
use actix_web::{
    Json,
    Result as ActixResult,
    HttpRequest,
    error::{
        ErrorBadRequest,
        ErrorInternalServerError
    }
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

// ------------------------------------------
// ----------------- Retail -----------------
// ------------------------------------------

#[derive(Serialize)]
pub struct Retail {
    pub id: i32,
    pub name: String,
    pub ingredients: String,
    pub mass: i32,
    pub price: i32,
    pub piece_fraction: Option<i32>,
    pub piece_mass: Option<i32>,
    pub piece_price: Option<i32>,
    pub vegan: bool,
    pub gluten_free: bool,
    pub image: String,
    pub category: i32,
    pub ord: i32
}

pub fn get_retail(req: HttpRequest<State>) -> ActixResult<Json<Vec<Retail>>> {
    use schema::retail::dsl::*;

    let conn = &*req.state().db_conn()?;

    let results = match req.query().get("category") {
        None => retail
            .load::<models::Retail>(conn)
            .map_err(|err| {
                ErrorInternalServerError(err)
            })?,
        Some(cat) => {
            let fil = cat.parse::<i32>()
                .map_err(|err| {
                    ErrorBadRequest(err)
                })?;

            retail
                .filter(category.eq(fil))
                .load::<models::Retail>(conn)
                .map_err(|err| {
                    ErrorInternalServerError(err)
                })?
        }
    };

    let mut json = Vec::<Retail>::with_capacity(results.len());

    for product in results {
        json.push(Retail {
            id: product.id,
            name: product.name,
            ingredients: product.ingredients,
            mass: product.mass,
            price: product.price,
            piece_fraction: product.piece_fraction,
            piece_mass: product.piece_mass,
            piece_price: product.piece_price,
            vegan: product.vegan,
            gluten_free: product.gluten_free,
            image: base64::encode(&product.image),
            category: product.category,
            ord: product.ord
        });
    }

    Ok(Json(json))
}

#[derive(Deserialize)]
pub struct RetailData {
    pub name: String,
    pub ingredients: String,
    pub mass: i32,
    pub price: i32,
    pub piece_fraction: Option<i32>,
    pub piece_mass: Option<i32>,
    pub piece_price: Option<i32>,
    pub vegan: bool,
    pub gluten_free: bool,
    pub image: String,
    pub category: i32
}

pub fn add_retail((retail_data, req): (Json<RetailData>, HttpRequest<State>)) -> ActixResult<String> {
    use schema::retail::dsl::*;

    let conn = &*req.state().db_conn()?;
    is_admin(&req, conn)?;

    diesel::insert_into(retail)
        .values(models::NewRetail {
            name: retail_data.name.clone(),
            ingredients: retail_data.ingredients.clone(),
            mass: retail_data.mass,
            price: retail_data.price,
            piece_fraction: retail_data.piece_fraction,
            piece_mass: retail_data.piece_mass,
            piece_price: retail_data.piece_price,
            vegan: retail_data.vegan,
            gluten_free: retail_data.gluten_free,
            image: base64::decode(&retail_data.image)
            .map_err(|err| {
                ErrorBadRequest(err)
            })?,
            category: retail_data.category,
            ord: 0
        })
        .execute(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    Ok(String::from("Success"))
}

pub fn edit_retail((retail_data, req): (Json<RetailData>, HttpRequest<State>)) -> ActixResult<String> {
    use schema::retail::dsl::*;

    let conn = &*req.state().db_conn()?;
    is_admin(&req, conn)?;

    let retail_id: i32 = req.match_info().query("retail_id")?;

    diesel::update(retail.filter(id.eq(retail_id)))
        .set((
            name.eq(&retail_data.name),
            ingredients.eq(&retail_data.ingredients),
            mass.eq(retail_data.mass),
            price.eq(retail_data.price),
            piece_fraction.eq(retail_data.piece_fraction),
            piece_mass.eq(retail_data.piece_mass),
            piece_price.eq(retail_data.piece_price),
            vegan.eq(retail_data.vegan),
            gluten_free.eq(retail_data.gluten_free),
            image.eq(base64::decode(&retail_data.image)
            .map_err(|err| {
                ErrorBadRequest(err)
            })?),
            category.eq(retail_data.category)
        ))
        .execute(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    Ok(String::from("Success"))
}

pub fn delete_retail(req: HttpRequest<State>) -> ActixResult<String> {
    use schema::retail::dsl::*;

    let conn = &*req.state().db_conn()?;
    is_admin(&req, conn)?;

    let retail_id: i32 = req.match_info().query("retail_id")?;

    diesel::delete(retail.filter(id.eq(retail_id)))
        .execute(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    Ok(String::from("Success"))
}

pub fn change_retail_order((order, req): (Json<Order>, HttpRequest<State>)) -> ActixResult<String> {
    change_order((order, req), "retail")
}

// ------------------------------------------
// --------------- Wholesale ----------------
// ------------------------------------------

#[derive(Serialize)]
pub struct Wholesale {
    pub id: i32,
    pub name: String,
    pub ingredients: String,
    pub mass: i32,
    pub netto: i32,
    pub brutto: i32,
    pub vat: i32,
    pub vegan: bool,
    pub gluten_free: bool,
    pub image: String,
    pub category: i32,
    pub ord: i32
}

pub fn get_wholesale(req: HttpRequest<State>) -> ActixResult<Json<Vec<Wholesale>>> {
    use schema::wholesale::dsl::*;

    let conn = &*req.state().db_conn()?;

    let results = match req.query().get("category") {
        None => wholesale
            .load::<models::Wholesale>(conn)
            .map_err(|err| {
                ErrorInternalServerError(err)
            })?,
        Some(cat) => {
            let fil = cat.parse::<i32>()
                .map_err(|err| {
                    ErrorBadRequest(err)
                })?;

            wholesale
                .filter(category.eq(fil))
                .load::<models::Wholesale>(conn)
                .map_err(|err| {
                    ErrorInternalServerError(err)
                })?
        }
    };

    let mut json = Vec::<Wholesale>::with_capacity(results.len());

    for product in results {
        json.push(Wholesale {
            id: product.id,
            name: product.name,
            ingredients: product.ingredients,
            mass: product.mass,
            netto: product.netto,
            brutto: product.brutto,
            vat: product.vat,
            vegan: product.vegan,
            gluten_free: product.gluten_free,
            image: base64::encode(&product.image),
            category: product.category,
            ord: product.ord
        });
    }

    Ok(Json(json))
}

#[derive(Deserialize)]
pub struct WholesaleData {
    pub name: String,
    pub ingredients: String,
    pub mass: i32,
    pub netto: i32,
    pub brutto: i32,
    pub vat: i32,
    pub vegan: bool,
    pub gluten_free: bool,
    pub image: String,
    pub category: i32
}

pub fn add_wholesale((wholesale_data, req): (Json<WholesaleData>, HttpRequest<State>)) -> ActixResult<String> {
    use schema::wholesale::dsl::*;

    let conn = &*req.state().db_conn()?;
    is_admin(&req, conn)?;

    diesel::insert_into(wholesale)
        .values(models::NewWholesale {
            name: wholesale_data.name.clone(),
            ingredients: wholesale_data.ingredients.clone(),
            mass: wholesale_data.mass,
            netto: wholesale_data.netto,
            brutto: wholesale_data.brutto,
            vat: wholesale_data.vat,
            vegan: wholesale_data.vegan,
            gluten_free: wholesale_data.gluten_free,
            image: base64::decode(&wholesale_data.image)
            .map_err(|err| {
                ErrorBadRequest(err)
            })?,
            category: wholesale_data.category,
            ord: 0
        })
        .execute(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    Ok(String::from("Success"))
}

pub fn edit_wholesale((wholesale_data, req): (Json<WholesaleData>, HttpRequest<State>)) -> ActixResult<String> {
    use schema::wholesale::dsl::*;

    let conn = &*req.state().db_conn()?;
    is_admin(&req, conn)?;

    let wholesale_id: i32 = req.match_info().query("wholesale_id")?;

    diesel::update(wholesale.filter(id.eq(wholesale_id)))
        .set((
            name.eq(&wholesale_data.name),
            ingredients.eq(&wholesale_data.ingredients),
            mass.eq(wholesale_data.mass),
            netto.eq(wholesale_data.netto),
            brutto.eq(wholesale_data.brutto),
            vat.eq(wholesale_data.vat),
            vegan.eq(wholesale_data.vegan),
            gluten_free.eq(wholesale_data.gluten_free),
            image.eq(base64::decode(&wholesale_data.image)
            .map_err(|err| {
                ErrorBadRequest(err)
            })?),
            category.eq(wholesale_data.category)
        ))
        .execute(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    Ok(String::from("Success"))
}

pub fn delete_wholesale(req: HttpRequest<State>) -> ActixResult<String> {
    use schema::wholesale::dsl::*;

    let conn = &*req.state().db_conn()?;
    is_admin(&req, conn)?;

    let wholesale_id: i32 = req.match_info().query("wholesale_id")?;

    diesel::delete(wholesale.filter(id.eq(wholesale_id)))
        .execute(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    Ok(String::from("Success"))
}

pub fn change_wholesale_order((order, req): (Json<Order>, HttpRequest<State>)) -> ActixResult<String> {
    change_order((order, req), "wholesale")
}
