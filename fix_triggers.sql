CREATE OR REPLACE FUNCTION sync_ownerships_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Sync from camelCase to snake_case
    IF NEW."ownerId" IS DISTINCT FROM OLD."ownerId" OR NEW."ownerId" IS NOT NULL THEN
      NEW."owner_id" = NEW."ownerId";
    END IF;
    
    IF NEW."dogId" IS DISTINCT FROM OLD."dogId" OR NEW."dogId" IS NOT NULL THEN
      NEW."dog_id" = NEW."dogId";
    END IF;
    
    IF NEW."startDate" IS DISTINCT FROM OLD."startDate" OR NEW."startDate" IS NOT NULL THEN
      NEW."start_date" = NEW."startDate";
    END IF;
    
    IF NEW."endDate" IS DISTINCT FROM OLD."endDate" OR NEW."endDate" IS NOT NULL THEN
      NEW."end_date" = NEW."endDate";
    END IF;
    
    IF NEW."is_current" IS DISTINCT FROM OLD."is_current" OR NEW."is_current" IS NOT NULL THEN
      NEW."isCurrent" = NEW."is_current";
    END IF;
    
    IF NEW."createdAt" IS DISTINCT FROM OLD."createdAt" OR NEW."createdAt" IS NOT NULL THEN
      NEW."created_at" = NEW."createdAt";
    END IF;
    
    IF NEW."updatedAt" IS DISTINCT FROM OLD."updatedAt" OR NEW."updatedAt" IS NOT NULL THEN
      NEW."updated_at" = NEW."updatedAt";
    END IF;

    IF NEW."transferDocumentUrl" IS DISTINCT FROM OLD."transferDocumentUrl" OR NEW."transferDocumentUrl" IS NOT NULL THEN
      NEW."transfer_document_url" = NEW."transferDocumentUrl";
    END IF;

    -- Sync from snake_case to camelCase
    IF NEW."owner_id" IS DISTINCT FROM OLD."owner_id" OR NEW."owner_id" IS NOT NULL THEN
      NEW."ownerId" = NEW."owner_id";
    END IF;
    
    IF NEW."dog_id" IS DISTINCT FROM OLD."dog_id" OR NEW."dog_id" IS NOT NULL THEN
      NEW."dogId" = NEW."dog_id";
    END IF;
    
    IF NEW."start_date" IS DISTINCT FROM OLD."start_date" OR NEW."start_date" IS NOT NULL THEN
      NEW."startDate" = NEW."start_date";
    END IF;
    
    IF NEW."end_date" IS DISTINCT FROM OLD."end_date" OR NEW."end_date" IS NOT NULL THEN
      NEW."endDate" = NEW."end_date";
    END IF;
    
    IF NEW."isCurrent" IS DISTINCT FROM OLD."isCurrent" OR NEW."isCurrent" IS NOT NULL THEN
      NEW."is_current" = NEW."isCurrent";
    END IF;
    
    IF NEW."created_at" IS DISTINCT FROM OLD."created_at" OR NEW."created_at" IS NOT NULL THEN
      NEW."createdAt" = NEW."created_at";
    END IF;
    
    IF NEW."updated_at" IS DISTINCT FROM OLD."updated_at" OR NEW."updated_at" IS NOT NULL THEN
      NEW."updatedAt" = NEW."updated_at";
    END IF;

    IF NEW."transfer_document_url" IS DISTINCT FROM OLD."transfer_document_url" OR NEW."transfer_document_url" IS NOT NULL THEN
      NEW."transferDocumentUrl" = NEW."transfer_document_url";
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
