DROP TABLE IF EXISTS meal_ingredient;
DROP TABLE IF EXISTS meal_attend;
DROP TABLE IF EXISTS meal;
DROP TABLE IF EXISTS purchase_line;
DROP TABLE IF EXISTS purchase;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS people;

CREATE TABLE people (
    id          INT         NOT NULL,
    name        VARCHAR(30) NOT NULL,
    email       VARCHAR()   UNIQUE,
    house_id    INT         NOT NULL,
    PRIMARY KEY id,
    FOREIGN KEY people(house_id) REFERENCES house(id)
);

CREATE TABLE item (
    item_id     INT         NOT NULL,
    item_name   VARCHAR(30) NOT NULL,
    count       INT         NOT NULL, 
    house_id    INT         NOT NULL, 
    cost_per_ct NUMERIC     NOT NULL,
    PRIMARY KEY item_id, house_id,
    FOREIGN KEY item(house_id) REFERENCES house(id)
);

CREATE TABLE purchase(
    p_id        INT         NOT NULL,
    house_id    INT         NOT NULL, 
    buyer_id    INT         NOT NULL, 
    purchase_at DATE        NOT NULL,
    PRIMARY KEY (p_id, house_id),
    FOREIGN KEY purchase(house_id) REFERENCES house(id),
    FOREIGN KEY purchase(buyer_id) REFERENCES people(id)
);

CREATE TABLE purchase_line(
    pl_id       INT         NOT NULL,
    p_id        INT         NOT NULL,
    item_id     INT         NOT NULL, 
    quantity    INT         NOT NULL, 
    cost_per_ct NUMERIC     NOT NULL,
    PRIMARY KEY pl_id, p_id,
    FOREIGN KEY purchase_line(p_id) REFERENCES purchase(p_id),
    FOREIGN KEY purchase_line(item_id) REFERENCES item(id),
);

CREATE TABLE meal   (
    meal_id     INT         NOT NULL, 
    house_id    INT         NOT NULL,
    meal_name   VARCHAR()   NOT NULL,
    made_on     DATE        NOT NULL,
    PRIMARY KEY meal_id, house_id,
    FOREIGN KEY meal(house_id) REFERENCES house(id)
);

CREATE TABLE meal_attend(
    meal_id     INT         NOT NULL,
    user_id     INT         NOT NULL
    PRIMARY KEY (meal_id, user_id),
    FOREIGN KEY meal_attend(meal_id) REFERENCES meal(meal_id),
    FOREIGN KEY meal_attend(user_id) REFERENCES people(id)
);

CREATE TABLE meal_ingredient(
    meal_id     INT         NOT NULL,
    item_id     INT         NOT NULL,
    quant_used  INT         NOT NULL,
    cost_per_ct NUMERIC     NOT NULL,
    PRIMARY KEY meal id,
    FOREIGN KEY meal_attend(meal_id) REFERENCES meal(meal_id),
    FOREIGN KEY meal_attend(item_id) REFERENCES item(item_id)
);
    
