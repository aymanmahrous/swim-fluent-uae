import assert from "node:assert/strict";
import test from "node:test";
import {
  hasStaffPermission,
  type StaffPermission,
  type StaffRole,
} from "../src/platform/staff-rbac.ts";

const permissions: StaffPermission[] = [
  "booking.status.update",
  "crm.workflow.update",
  "conversation.mode.update",
  "content.item.update",
  "content.item.transition",
  "content.generate",
  "media.generate",
  "automation.status.read",
];

const expectedByRole: Record<StaffRole, StaffPermission[]> = {
  super_admin: permissions,
  admin: permissions,
  reception: [
    "booking.status.update",
    "crm.workflow.update",
    "conversation.mode.update",
  ],
  coach: ["crm.workflow.update"],
  content_manager: [
    "content.item.update",
    "content.item.transition",
    "content.generate",
    "media.generate",
    "automation.status.read",
  ],
};

for (const [role, allowedPermissions] of Object.entries(expectedByRole) as Array<
  [StaffRole, StaffPermission[]]
>) {
  test(`${role} keeps the audited RBAC permission boundary`, () => {
    const allowed = new Set(allowedPermissions);

    for (const permission of permissions) {
      assert.equal(
        hasStaffPermission(role, permission),
        allowed.has(permission),
        `${role} permission mismatch for ${permission}`,
      );
    }
  });
}
