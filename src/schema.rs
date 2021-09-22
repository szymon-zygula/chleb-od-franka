table! {
    categories (id) {
        id -> Int4,
        name -> Varchar,
        ord -> Int4,
    }
}

table! {
    retail (id) {
        id -> Int4,
        name -> Varchar,
        ingredients -> Varchar,
        mass -> Int4,
        price -> Int4,
        piece_fraction -> Nullable<Int4>,
        piece_mass -> Nullable<Int4>,
        piece_price -> Nullable<Int4>,
        vegan -> Bool,
        gluten_free -> Bool,
        image -> Bytea,
        category -> Int4,
        ord -> Int4,
    }
}

table! {
    users (id) {
        id -> Int4,
        login -> Varchar,
        password -> Varchar,
        salt -> Varchar,
        token -> Nullable<Varchar>,
    }
}

table! {
    wholesale (id) {
        id -> Int4,
        name -> Varchar,
        ingredients -> Varchar,
        mass -> Int4,
        netto -> Int4,
        brutto -> Int4,
        vat -> Int4,
        vegan -> Bool,
        gluten_free -> Bool,
        image -> Bytea,
        category -> Int4,
        ord -> Int4,
    }
}

joinable!(retail -> categories (category));
joinable!(wholesale -> categories (category));

allow_tables_to_appear_in_same_query!(
    categories,
    retail,
    users,
    wholesale,
);
