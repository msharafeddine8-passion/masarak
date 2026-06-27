-- Cleanup: notify_org_scholarship is superseded by the generic
-- notify_org_affiliates(p_org_id, p_kind, p_title); the event listener no longer
-- calls it. Safe to drop.
drop function if exists notify_org_scholarship(uuid, text);
