-- Performance indexes for workspace-scoped reads and project child loading
CREATE INDEX IF NOT EXISTS idx_projects_workspace_updated
  ON projects(workspace_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_issues_workspace_created
  ON issues(workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_habits_workspace_created
  ON habits(workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project_sort
  ON project_milestones(project_id, sort_order, target_date);

CREATE INDEX IF NOT EXISTS idx_project_links_project
  ON project_links(project_id);
