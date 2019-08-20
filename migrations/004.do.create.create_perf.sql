create table fund_perf(
	perf_id SERIAL primary key,
	perf_date TEXT not null,
	perf DOUBLE precision,
	date_created TIMESTAMP NOT NULL DEFAULT now(),
	date_modified TIMESTAMP
);

ALTER TABLE fund_perf
  ADD COLUMN
    fund_id INTEGER REFERENCES fund (fund_id)
    ON DELETE SET NULL;