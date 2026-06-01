-- Restrict Realtime channel subscriptions: only allow authenticated users
-- to subscribe to topics scoped to their own user id (e.g. "user:<uid>").
-- Postgres Changes on finance tables continue to be filtered by table RLS.

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access their own realtime topic" ON realtime.messages;

CREATE POLICY "Users can only access their own realtime topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'user:' || (select auth.uid())::text
);

DROP POLICY IF EXISTS "Users can only send to their own realtime topic" ON realtime.messages;

CREATE POLICY "Users can only send to their own realtime topic"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() = 'user:' || (select auth.uid())::text
);
