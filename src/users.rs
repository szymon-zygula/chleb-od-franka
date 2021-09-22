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

use models;
use schema::users;
use crypto;
use state::State;
use auth::is_admin;

#[derive(Serialize)]
pub struct User {
    pub id: i32,
    pub login: String
}

pub fn get_users(req: HttpRequest<State>) -> ActixResult<Json<Vec<User>>> {
    use schema::users::dsl::*;

    let conn = &*req.state().db_conn()?;
    is_admin(&req, conn)?;

    let results = users
        .load::<models::User>(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    let mut users_json = Vec::<User>::with_capacity(results.len());

    for user in results {
        users_json.push(User {
            id: user.id,
            login: user.login
        });
    }

    Ok(Json(users_json))
}

#[derive(Deserialize)]
pub struct UserData {
    pub login: String,
    pub password: String
}

pub fn add_user((user_data, req): (Json<UserData>, HttpRequest<State>)) -> ActixResult<String> {
    use schema::users::dsl::*;

    if user_data.login == "" || user_data.password == "" {
        return Err(ErrorInternalServerError(false));
    }

    let conn = &*req.state().db_conn()?;
    is_admin(&req, conn)?;

    let hash = crypto::hash(&user_data.password);

    diesel::insert_into(users)
        .values(models::NewUser {
            login: user_data.login.clone(),
            password: hash.hash.clone(),
            salt: hash.salt.clone()
        })
        .execute(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    Ok(String::from("Success"))
}

#[derive(Deserialize)]
pub struct UserEdit {
    pub login: Option<String>,
    pub password: Option<String>
}

#[derive(AsChangeset)]
#[table_name="users"]
struct UserChange {
    pub login: Option<String>,
    pub password: Option<String>,
    pub salt: Option<String>
}

pub fn edit_user((user_data, req): (Json<UserEdit>, HttpRequest<State>)) -> ActixResult<String> {
    use schema::users::dsl::*;

    if user_data.login == Some("".to_string()) {
        return Err(ErrorInternalServerError(false));
    }

    let conn = &*req.state().db_conn()?;
    is_admin(&req, conn)?;

    let user_id: i32 = req.match_info().query("user_id")?;

    let mut update_set = UserChange {
        login: user_data.login.clone(),
        password: None,
        salt: None
    };

    if let Some(pass) = user_data.password.clone() {
        if user_data.password != Some("".to_string()) {
            let hash = crypto::hash(&pass);
            update_set.password = Some(hash.hash);
            update_set.salt = Some(hash.salt);
        }
    }

    diesel::update(users.filter(id.eq(user_id)))
        .set(&update_set)
        .execute(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    Ok(String::from("Success"))
}

pub fn delete_user(req: HttpRequest<State>) -> ActixResult<String> {
    use schema::users::dsl::*;

    let conn = &*req.state().db_conn()?;
    is_admin(&req, conn)?;

    let user_id: i32 = req.match_info().query("user_id")?;

    diesel::delete(users.filter(id.eq(user_id)))
        .execute(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    Ok(String::from("Success"))
}
