use schema::users;
use schema::retail;
use schema::wholesale;
use schema::categories;

#[derive(Queryable)]
pub struct User {
    pub id: i32,
    pub login: String,
    pub password: String,
    pub salt: String,
    pub token: Option<String>
}

#[derive(Insertable)]
#[table_name="users"]
pub struct NewUser {
    pub login: String,
    pub password: String,
    pub salt: String,
}

#[derive(Queryable)]
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
    pub image: Vec<u8>,
    pub category: i32,
    pub ord: i32
}

#[derive(Insertable)]
#[table_name="retail"]
pub struct NewRetail {
    pub name: String,
    pub ingredients: String,
    pub mass: i32,
    pub price: i32,
    pub piece_fraction: Option<i32>,
    pub piece_mass: Option<i32>,
    pub piece_price: Option<i32>,
    pub vegan: bool,
    pub gluten_free: bool,
    pub image: Vec<u8>,
    pub category: i32,
    pub ord: i32
}

#[derive(Queryable)]
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
    pub image: Vec<u8>,
    pub category: i32,
    pub ord: i32
}

#[derive(Insertable)]
#[table_name="wholesale"]
pub struct NewWholesale {
    pub name: String,
    pub ingredients: String,
    pub mass: i32,
    pub netto: i32,
    pub brutto: i32,
    pub vat: i32,
    pub vegan: bool,
    pub gluten_free: bool,
    pub image: Vec<u8>,
    pub category: i32,
    pub ord: i32
}

#[derive(Queryable, Serialize)]
pub struct Category {
    pub id: i32,
    pub name: String,
    pub ord: i32
}

#[derive(Insertable)]
#[table_name="categories"]
pub struct NewCategory {
    pub name: String,
    pub ord: i32
}
