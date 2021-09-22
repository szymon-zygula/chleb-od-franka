#[macro_use]
extern crate serde_derive;
extern crate serde;
extern crate serde_json;
extern crate actix_web;
extern crate dotenv;
extern crate r2d2;
#[macro_use]
extern crate diesel;
extern crate rand;
extern crate base64;
extern crate argon2rs;
extern crate futures;

use actix_web::{
    server,
    App,
    http::{
        Method,
        header
    },
    middleware::cors
};

use dotenv::dotenv;
use std::env;
use r2d2::Pool;
use diesel::{
    r2d2::ConnectionManager,
};

mod crypto;
mod schema;
mod models;
mod auth;
mod users;
mod state;
mod products;
mod order;
mod categories;

use state::State;

fn check_env(var: &str) -> String {
    let err = format!("No {} environmental variable set!", var);
    env::var(var).expect(&err)
}

fn main() {
    dotenv().ok();

    println!("Connecting to database...");

    let db_url = check_env("DATABASE_URL");
    let manager = ConnectionManager::new(db_url);
    let pool = Pool::builder()
        .max_size(20)
        .build(manager)
        .expect("Could not create database pool!");

    let address = check_env("ADDRESS");
    println!("Starting HTTP server on {}...", address);

    static MAX_SIZE: usize = 50 * 1024 * 1024; // 50MB

    let server = server::new(move || {
        let cors = cors::Cors::build()
            .allowed_origin(&check_env("ALLOW_ORIGIN"))
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "PATCH"])
            .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT, header::ACCESS_CONTROL_ALLOW_ORIGIN, header::CONTENT_TYPE])
            .max_age(3600)
            .finish();

        let state = State {
            pool: pool.clone()
        };

        App::with_state(state)
            .middleware(cors)
            .prefix("/")
            .resource("/users", |r| r.method(Method::POST).with(users::add_user))
            .resource("/retail", |r| r.method(Method::POST)
                .with_config(products::add_retail, |cfg| {
                    (cfg.0).0.limit(MAX_SIZE);
                    ()
                }))
            .resource("/wholesale", |r| r.method(Method::POST)
                .with_config(products::add_wholesale, |cfg| {
                    (cfg.0).0.limit(MAX_SIZE);
                    ()
                }))
            .resource("/wholesale/{wholesale_id}", |r| r.method(Method::PUT)
                .with_config(products::edit_wholesale, |cfg| {
                    (cfg.0).0.limit(MAX_SIZE);
                }))
            .resource("/retail/{retail_id}", |r| r.method(Method::PUT)
                .with_config(products::edit_retail, |cfg| {
                    (cfg.0).0.limit(MAX_SIZE);
                }))
            .resource("/categories", |r| r.method(Method::POST).with(categories::add_category))

            .route("/users", Method::GET, users::get_users)
            .route("/users/{user_id}", Method::PUT, users::edit_user)
            .route("/users/{user_id}", Method::DELETE, users::delete_user)

            .route("/login", Method::POST, auth::login)
            .route("/logout", Method::POST, auth::logout)

            .route("/retail", Method::GET, products::get_retail)
            .route("/retail/{retail_id}", Method::DELETE, products::delete_retail)
            .route("/retail", Method::PUT, products::change_retail_order)

            .route("/wholesale", Method::GET, products::get_wholesale)
            .route("/wholesale/{wholesale_id}", Method::DELETE, products::delete_wholesale)
            .route("/wholesale", Method::PUT, products::change_wholesale_order)

            .route("/categories", Method::GET, categories::get_categories)
            .route("/categories/{category_id}", Method::PUT, categories::edit_category)
            .route("/categories/{category_id}", Method::DELETE, categories::delete_category)
            .route("/categories", Method::PUT, categories::change_categories_order)
            .finish()
    });

    server
        .bind(address)
        .expect("Could not start the HTTP server!")
        .run();
}
