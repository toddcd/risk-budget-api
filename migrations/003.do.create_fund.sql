create table fund (
	fund_id SERIAL primary key,
	ticker TEXT not null,
	name text not null,
	weight DOUBLE precision not null,
	risk DOUBLE precision not null,
	return DOUBLE precision not null,
	date_created TIMESTAMP NOT NULL DEFAULT now(),
	date_modified TIMESTAMP
);

ALTER TABLE fund
  ADD COLUMN
    port_id INTEGER REFERENCES portfolio (port_id)
    ON DELETE SET NULL;