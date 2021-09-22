use actix_web::{
    Json,
    HttpRequest,
    HttpResponse,
    Result as ActixResult,
    http::{
        StatusCode,
        Cookie
    },
    error::{
        ErrorInternalServerError,
        ErrorUnauthorized
    }
};

use diesel::{
    self,
    pg::PgConnection,
    prelude::*
};

use models::User;
use state::State;
use crypto;

pub fn is_admin<T>(req: &HttpRequest<T>, conn: &PgConnection) -> ActixResult<bool> {
    use schema::users::dsl::*;
    if let Some(clogin) = req.cookie("login") {
        let clogin = clogin.value();
        if let Some(ctoken) = req.cookie("token") {
            let ctoken = ctoken.value();
            let user = users
                .filter(login.eq(clogin))
                .first::<User>(conn)
                .map_err(|err| {
                    ErrorInternalServerError(err)
                })?;

            match user.token {
                Some(ref ttoken) if ttoken == ctoken => {
                    return Ok(true);
                }
                _ => ()
            }
        }
    }

    Err(ErrorUnauthorized(false))
}

#[derive(Deserialize)]
pub struct UserData {
    pub login: String,
    pub password: String
}

pub fn login((user_data, req): (Json<UserData>, HttpRequest<State>)) -> ActixResult<HttpResponse> {
    use schema::users::dsl::*;

    let conn = &*req.state().db_conn()?;

    let result = users.filter(login.eq(&user_data.login))
        .first::<User>(conn)
        .map_err(|err| {
            ErrorInternalServerError(err)
        })?;

    if crypto::check(&user_data.password, &crypto::Hash { hash: result.password, salt: result.salt }) {
        let mut res = HttpResponse::new(StatusCode::OK);
        let cookie_token = crypto::token();

        diesel::update(users.filter(id.eq(result.id)))
            .set(token.eq(&cookie_token))
            .execute(conn)
            .map_err(|err| ErrorInternalServerError(err))?;

        res.add_cookie(&Cookie::new("token", cookie_token))
            .map_err(|err| ErrorInternalServerError(err))?;

        res.add_cookie(&Cookie::new("login", result.login))
            .map_err(|err| ErrorInternalServerError(err))?;

        Ok(res)
    }
    else {
        Err(ErrorUnauthorized(false))
    }
}

pub fn logout(req: HttpRequest<State>) -> ActixResult<HttpResponse> {
    use schema::users::dsl::*;

    let conn = &*req.state().db_conn()?;

    let mut res = HttpResponse::Ok();

    if let Some(clogin) = req.cookie("login") {
        let null: Option<String> = None;
        diesel::update(users.filter(login.eq(clogin.value())))
            .set(token.eq(null))
            .execute(conn)
            .map_err(|err| ErrorInternalServerError(err))?;

        res.del_cookie(&clogin);
    }

    if let Some(ctoken) = req.cookie("token") {
        res.del_cookie(&ctoken);
    }

    Ok(res.finish())
}
