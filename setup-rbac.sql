-- RBAC Setup Script for OffiNeeds OMS
-- Run this script in your Supabase database to set up the role-based access control system

-- Create access_level_enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_level_enum') THEN
    CREATE TYPE oms_offineeds.access_level_enum AS ENUM ('read', 'write', 'admin');
  END IF;
END
$$;

-- Create User_roles table
CREATE TABLE IF NOT EXISTS oms_offineeds."User_roles" (
  "Role_ID" smallint NOT NULL,
  "Role_Name" character varying(50) NOT NULL,
  "Role_Description" text,
  "Is_Active" boolean DEFAULT true,
  "Created_At" timestamp with time zone DEFAULT now(),
  "Updated_At" timestamp with time zone DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY ("Role_ID")
);

-- Create User_modules table
CREATE TABLE IF NOT EXISTS oms_offineeds."User_modules" (
  "Module_ID" smallint NOT NULL,
  "module_name" character varying(50) NOT NULL,
  "Module_Description" text,
  "Is_Active" boolean DEFAULT true,
  "Created_At" timestamp with time zone DEFAULT now(),
  "Updated_At" timestamp with time zone DEFAULT now(),
  CONSTRAINT user_modules_pkey PRIMARY KEY ("Module_ID"),
  CONSTRAINT user_modules_name_key UNIQUE ("module_name")
);

-- Insert default roles
INSERT INTO oms_offineeds."User_roles" ("Role_ID", "Role_Name", "Role_Description") VALUES
(1, 'admin', 'Full system administrator with all permissions'),
(2, 'editor', 'Editor with read and write permissions for most modules'),
(3, 'viewer', 'Viewer with read-only access to limited modules')
ON CONFLICT ("Role_ID") DO NOTHING;

-- Insert default modules
INSERT INTO oms_offineeds."User_modules" ("Module_ID", "module_name", "Module_Description") VALUES
(1, 'Dashboard', 'Main dashboard and overview'),
(2, 'JobCards', 'Production job management'),
(3, 'ProductLibrary', 'Product catalog and specifications'),
(4, 'ReturnInventory', 'Returned inventory management'),
(5, 'ReadyInventory', 'Ready-to-ship inventory tracking'),
(6, 'PurchaseOrders', 'Purchase order management'),
(7, 'Admin', 'System administration'),
(8, 'AdminOnboarding', 'Employee onboarding')
ON CONFLICT ("Module_ID") DO NOTHING;

-- Create user_access table if it doesn't exist
CREATE TABLE IF NOT EXISTS oms_offineeds.user_access (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  role_id smallint NULL,
  module_id character varying NULL,
  access_level oms_offineeds.access_level_enum NOT NULL DEFAULT 'read'::oms_offineeds.access_level_enum,
  status character varying(20) NULL DEFAULT 'active'::character varying,
  created_at timestamp with time zone NULL DEFAULT now(),
  created_by uuid NULL,
  updated_at timestamp with time zone NULL DEFAULT now(),
  updated_by uuid NULL,
  CONSTRAINT user_access_pkey PRIMARY KEY (id),
  CONSTRAINT user_access_created_by_fkey FOREIGN KEY (created_by) REFERENCES oms_offineeds.users (id),
  CONSTRAINT user_access_module_id_fkey FOREIGN KEY (module_id) REFERENCES oms_offineeds."User_modules" (module_name) ON DELETE CASCADE,
  CONSTRAINT user_access_role_id_fkey FOREIGN KEY (role_id) REFERENCES oms_offineeds."User_roles" ("Role_ID") ON DELETE CASCADE,
  CONSTRAINT user_access_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES oms_offineeds.users (id),
  CONSTRAINT user_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES oms_offineeds.users (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_access_user_id ON oms_offineeds.user_access (user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_role_id ON oms_offineeds.user_access (role_id);
CREATE INDEX IF NOT EXISTS idx_user_access_module_id ON oms_offineeds.user_access (module_id);
CREATE INDEX IF NOT EXISTS idx_user_access_status ON oms_offineeds.user_access (status);

-- Create a function to automatically create user access for new users
CREATE OR REPLACE FUNCTION oms_offineeds.create_default_user_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default viewer access for new users
  INSERT INTO oms_offineeds.user_access (user_id, role_id, module_id, access_level, status, created_by, updated_by)
  VALUES 
    (NEW.id, 3, 'Dashboard', 'read', 'active', NEW.id, NEW.id),
    (NEW.id, 3, 'ProductLibrary', 'read', 'active', NEW.id, NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create user access when a new user is created
DROP TRIGGER IF EXISTS trigger_create_user_access ON oms_offineeds.users;
CREATE TRIGGER trigger_create_user_access
  AFTER INSERT ON oms_offineeds.users
  FOR EACH ROW
  EXECUTE FUNCTION oms_offineeds.create_default_user_access();

-- Create a function to update user access timestamps
CREATE OR REPLACE FUNCTION oms_offineeds.update_user_access_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamps
DROP TRIGGER IF EXISTS trigger_update_user_access_timestamp ON oms_offineeds.user_access;
CREATE TRIGGER trigger_update_user_access_timestamp
  BEFORE UPDATE ON oms_offineeds.user_access
  FOR EACH ROW
  EXECUTE FUNCTION oms_offineeds.update_user_access_timestamp();

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT USAGE ON SCHEMA oms_offineeds TO authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA oms_offineeds TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA oms_offineeds TO authenticated;

-- Enable Row Level Security (RLS) if needed
-- ALTER TABLE oms_offineeds.user_access ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE oms_offineeds."User_roles" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE oms_offineeds."User_modules" ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE oms_offineeds.user_access IS 'User access control table for RBAC system';
COMMENT ON TABLE oms_offineeds."User_roles" IS 'Available roles in the system';
COMMENT ON TABLE oms_offineeds."User_modules" IS 'Available modules in the system'; 