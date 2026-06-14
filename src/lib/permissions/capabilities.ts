// src/lib/permissions/capabilities.ts
// The single source of truth for who-can-do-what across Masarak.
// See: docs/ARCHITECTURE.md §2

export type Capability = string;  // 'domain.action.scope' format

export type Role =
  | 'student'
  | 'parent'
  | 'org_owner'
  | 'org_editor'
  | 'sponsor'
  | 'super_admin';

/** Wildcard — only used by super_admin */
const ALL: Capability[] = ['*'];

export const CAPABILITIES: Record<Role, Capability[]> = {
  student: [
    'view.self', 'edit.self',
    'view.university.public', 'view.school.public',
    'view.scholarship.public', 'view.career.public', 'view.major.public',
    'save.item.self', 'unsave.item.self',
    'complete.dna.self', 'view.dna.self',
    'apply.scholarship.self', 'apply.event.self',
    'send.message.to.org',
    'view.notifications.self', 'manage.notification_prefs.self',
  ],
  parent: [
    'view.self', 'edit.self',
    'view.student.linked', 'view.reports.linked',
    'manage.parent.links.self',
    'view.notifications.self', 'manage.notification_prefs.self',
  ],
  org_owner: [
    'view.self', 'edit.self',
    'view.org.profile.own', 'edit.org.profile.own',
    'view.org.media.own', 'edit.org.media.own',
    'view.org.events.own', 'edit.org.events.own',
    'view.org.announcements.own', 'edit.org.announcements.own',
    'view.org.students.own',
    'view.org.leads.own', 'edit.org.leads.own',
    'view.org.analytics.own',
    'send.message.to.student',
    'invite.org.member.own',
    'view.notifications.self', 'manage.notification_prefs.self',
  ],
  org_editor: [
    'view.self', 'edit.self',
    'view.org.profile.own', 'edit.org.profile.own',
    'view.org.media.own', 'edit.org.media.own',
    'view.org.events.own', 'edit.org.events.own',
    'view.org.announcements.own', 'edit.org.announcements.own',
    'view.org.analytics.own',
    'send.message.to.student',
    'view.notifications.self', 'manage.notification_prefs.self',
  ],
  sponsor: [
    'view.self', 'edit.self',
    'view.sponsor.campaigns.own', 'edit.sponsor.campaigns.own',
    'view.sponsor.analytics.own',
    'view.notifications.self', 'manage.notification_prefs.self',
  ],
  super_admin: ALL,
};

/** Special admin email — also gets super_admin capabilities at runtime */
export const ADMIN_EMAIL = 'msharafeddine8@gmail.com';
