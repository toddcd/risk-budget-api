create table portfolio (
	port_id SERIAL primary key,
	name TEXT not null,
	date_created TIMESTAMP NOT NULL DEFAULT now(),
 	date_modified TIMESTAMP
);

ALTER TABLE portfolio
  ADD COLUMN
    user_id INTEGER REFERENCES users (user_id)
    ON DELETE SET NULL;