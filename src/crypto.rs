use argon2rs;
use base64;
use rand::{Rng, thread_rng};

const SALT_SIZE: usize = 16; // Can not be larger than 32
const TOKEN_SIZE: usize = 96;

pub struct Hash {
    pub hash: String,
    pub salt: String
}

pub fn hash(password: &str) -> Hash {
    let mut rng = thread_rng();
    let salt = base64::encode(&rng.gen::<[u8; SALT_SIZE]>());

    let hash = argon2rs::argon2i_simple(password, &salt);

    Hash {
        hash: base64::encode(&hash),
        salt
    }
}

pub fn check(password: &str, hash: &Hash) -> bool {
    base64::encode(&argon2rs::argon2i_simple(password, &hash.salt)) == hash.hash
}

pub fn token() -> String {
    let mut random = Vec::with_capacity(TOKEN_SIZE);

    let mut rng = thread_rng();
    for _ in 0..TOKEN_SIZE {
        random.push(rng.gen());
    }

    base64::encode(&random)
}
