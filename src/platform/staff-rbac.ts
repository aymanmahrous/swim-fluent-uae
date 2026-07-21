import type { StaffProfile } from "./staff-session.server";

export type StaffRole = StaffProfile["role"];

export type StaffPermission =
  | "booking.status.update"
  | "crm.workflow.update"
  | "content.item.update"
  | "content.item.transition"
  | "content.generate"
  | "media.generate";

const permissionsByRole: Readonly<Record<StaffRole, ReadonlySet<StaffPermission>>> = {
  super_admin: new Set([
    "booking.status.update",
    "crm.workflow.update",
    "content.item.update",
    "content.item.transition",
    "content.generate",
    "media.generate",
  ]),
  admin: new Set([
    "booking.status.update",
    "crm.workflow.update",
    "content.item.update",
    "content.item.transition",
    "content.generate",
    "media.generate",
  ]),
  reception: new Set(["booking.status.update", "crm.workflow.update"]),
  coach: new Set(["crm.workflow.update"]),
  content_manager: new Set([
    "content.item.update",
    "content.item.transition",
    "content.generate",
    "media.generate",
  ]),
};

export function hasStaffPermission(role: StaffRole, permission: StaffPermission): boolean {
  return permissionsByRole[role].has(permission);
}
