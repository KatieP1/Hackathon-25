DROP TABLE IF EXISTS meal_ingredient;
DROP TABLE IF EXISTS meal_attend;
DROP TABLE IF EXISTS meal;
DROP TABLE IF EXISTS purchase_line;
DROP TABLE IF EXISTS purchase;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS people;
DROP TABLE IF EXISTS house;

CREATE TABLE house (
    id          INT         NOT NULL,
    name        VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO house
VALUES  (1, 'Astor'),
        (2, 'Corkery');

CREATE TABLE people (
    id          INT         NOT NULL,
    name        VARCHAR(30) NOT NULL,
    email       VARCHAR     UNIQUE,
    house_id    INT         NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (house_id) REFERENCES house(id)
);

INSERT INTO people 
VALUES  (1, 'Alice', 'alice@yahoo.com', 1),
        (2, 'Alan', 'alan@yahoo.com', 1),
        (3, 'Tom', 'Tom@yahoo.com', 2);

CREATE TABLE item (
    item_id     INT         NOT NULL,
    item_name   VARCHAR(30) NOT NULL,
    count       INT         NOT NULL, 
    house_id    INT         NOT NULL, 
    cost_per_ct NUMERIC     NOT NULL,
    PRIMARY KEY (item_id, house_id),
    FOREIGN KEY (house_id) REFERENCES house(id)
);

INSERT INTO item
VALUES  (1, 'Redbull', 1, 1, 2),
        (2, 'Coffee', 3, 2, 4),
        (3, 'Noodle', 1, 2, 5);

CREATE TABLE purchase(
    p_id        INT         NOT NULL,
    house_id    INT         NOT NULL, 
    buyer_id    INT         NOT NULL, 
    purchase_at DATE        NOT NULL,
    PRIMARY KEY (p_id, house_id),
    FOREIGN KEY (house_id) REFERENCES house(id),
    FOREIGN KEY (buyer_id) REFERENCES people(id)
);

INSERT INTO purchase
VALUES  (1, 2, 1, '2025-11-08'),
        (2, 1, 2, '2025-09-20'),
        (3, 1, 2, '2025-09-20');

CREATE TABLE purchase_line(
    pl_id       INT         NOT NULL,
    p_id        INT         NOT NULL,
    item_id     INT         NOT NULL, 
    quantity    INT         NOT NULL, 
    cost_per_ct NUMERIC     NOT NULL,
    PRIMARY KEY (pl_id, p_id),
    FOREIGN KEY (p_id) REFERENCES purchase(p_id),
    FOREIGN KEY (item_id) REFERENCES item(item_id)
);

INSERT INTO purchase_line
VALUES  (1, 1, 1, 1, 12),
        (2, 1, 2, 3, 4);

CREATE TABLE meal   (
    meal_id     INT         NOT NULL, 
    house_id    INT         NOT NULL,
    meal_name   VARCHAR     NOT NULL,
    made_on     DATE        NOT NULL,
    PRIMARY KEY (meal_id, house_id),
    FOREIGN KEY (house_id) REFERENCES house(id)
);

INSERT INTO meal
VALUES  (1, 1, 'Spaghetti', '2025-01-01'),
        (2, 1, 'Fried Chicken', '2025-10-31'),
        (3, 2, 'Steak', '2025-09-20');

CREATE TABLE meal_attend(
    meal_id     INT         NOT NULL,
    user_id     INT         NOT NULL,
    PRIMARY KEY (meal_id, user_id),
    FOREIGN KEY (meal_id) REFERENCES meal(meal_id),
    FOREIGN KEY (user_id) REFERENCES people(id)
);

INSERT INTO meal_attend
VALUES  (1, 1),
        (1, 2),
        (3, 1);

CREATE TABLE meal_ingredient(
    meal_id     INT         NOT NULL,
    item_id     INT         NOT NULL,
    quant_used  INT         NOT NULL,
    cost_per_ct NUMERIC     NOT NULL,
    PRIMARY KEY (meal_id),
    FOREIGN KEY (meal_id) REFERENCES meal(meal_id),
    FOREIGN KEY (item_id, cost_per_ct) REFERENCES item(item_id, cost_per_ct)
);

INSERT INTO meal_ingredient
VALUES  (1, 3, 1, 2),
        (1, 1, 2, 2),
        (2, 3, 2, 5);
    
