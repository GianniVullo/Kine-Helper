ALTER TABLE patients
ADD COLUMN organization_id TEXT;

-- Add organization_id to kinesitherapeutes (physiotherapists) table
ALTER TABLE kines
ADD COLUMN organization_id TEXT;

-- Add organization_id to situations_pathologiques
ALTER TABLE situations_pathologiques 
ADD COLUMN organization_id TEXT;

-- Add organization_id to prescriptions
ALTER TABLE prescriptions 
ADD COLUMN organization_id TEXT;

-- Add organization_id to seances (sessions)
ALTER TABLE seances 
ADD COLUMN organization_id TEXT;

-- Add organization_id to attestations
ALTER TABLE attestations 
ADD COLUMN organization_id TEXT;

-- Add organization_id to accords
ALTER TABLE accords 
ADD COLUMN organization_id TEXT;

-- Add organization_id to factures (invoices)
ALTER TABLE factures 
ADD COLUMN organization_id TEXT;

-- Add organization_id to factures_attestations
ALTER TABLE factures_attestations 
ADD COLUMN organization_id TEXT;

-- Add organization_id to documents
ALTER TABLE documents 
ADD COLUMN organization_id TEXT;

-- Add organization_id to tarifs (rates)
ALTER TABLE tarifs 
ADD COLUMN organization_id TEXT;

-- Add organization_id to supplements
ALTER TABLE supplements 
ADD COLUMN organization_id TEXT;

-- Settings table - add organization context
ALTER TABLE settings 
ADD COLUMN organization_id TEXT;

