-- ==============================================
-- NoxPay Migration: Teams & Organizations
-- Run this in Supabase SQL Editor after migration_profiles.sql
-- ==============================================

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members join table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(team_id, user_id)
);

-- Link clients to teams (a client can optionally belong to a team)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- RLS for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Team owners and members can view their teams
CREATE POLICY "Team members can view team"
    ON teams FOR SELECT
    USING (
        owner_id = auth.uid() OR
        id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Team owners can update team"
    ON teams FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create teams"
    ON teams FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Team members can view membership
CREATE POLICY "Members can view team membership"
    ON team_members FOR SELECT
    USING (
        user_id = auth.uid() OR
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    );

-- Only team owners/admins can manage members
CREATE POLICY "Team owners can manage members"
    ON team_members FOR INSERT
    WITH CHECK (
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()) OR
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

CREATE POLICY "Team owners can remove members"
    ON team_members FOR DELETE
    USING (
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()) OR
        user_id = auth.uid()
    );

-- Update RLS on clients to allow team access
CREATE POLICY "Team members can view team clients"
    ON clients FOR SELECT
    USING (
        team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
    );

-- Auto-update timestamps
CREATE TRIGGER set_timestamp_teams
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();