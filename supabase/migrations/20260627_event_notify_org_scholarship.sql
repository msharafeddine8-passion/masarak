-- Event-driven (Step 4): when an institution publishes a scholarship from its
-- dashboard, its verified affiliated students get notified. Wired via
-- emit('org.published_scholarship') → fireListeners → notify_org_scholarship RPC.
-- SECURITY DEFINER + a caller-must-manage-org guard (a student can't read
-- org_members or insert notifications for others under RLS).
create or replace function notify_org_scholarship(p_org_id uuid, p_title text) returns jsonb
language plpgsql security definer set search_path to 'public','pg_catalog' as $$
declare v_caller uuid := auth.uid();
        v_name text; v_type text; v_entity bigint; v_link text; v_count int := 0; v_aff record;
begin
  if v_caller is null then return jsonb_build_object('ok',false,'error','not_signed_in'); end if;
  if not exists (select 1 from org_members
                 where org_id=p_org_id and user_id=v_caller and role in ('owner','admin','editor')) then
    return jsonb_build_object('ok',false,'error','forbidden');
  end if;
  select display_name, org_type, entity_id into v_name, v_type, v_entity
    from organizations where id=p_org_id;
  v_link := case when v_type='university' and v_entity is not null then '/universities/'||v_entity
                 when v_type='school' and v_entity is not null then '/schools/'||v_entity
                 else '/scholarships' end;
  for v_aff in select user_id from org_affiliations
               where org_id=p_org_id and status='verified' loop
    insert into notifications (user_id,type,title,body,link_url,severity,created_by)
    values (v_aff.user_id,'org.scholarship',
            'منحة جديدة من '||coalesce(v_name,'مؤسستك')||' 🎓',
            coalesce(nullif(p_title,''),'منحة جديدة')||' — اطّلع على التفاصيل.',
            v_link,'info',v_caller);
    v_count := v_count + 1;
  end loop;
  return jsonb_build_object('ok',true,'notified',v_count);
end; $$;
