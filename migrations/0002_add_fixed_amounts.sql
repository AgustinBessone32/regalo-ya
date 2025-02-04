
DO $$ BEGIN
 ALTER TABLE projects ADD COLUMN fixed_amount_1 integer;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE projects ADD COLUMN fixed_amount_2 integer;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE projects ADD COLUMN fixed_amount_3 integer;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
