import { describe, it, expect } from 'vitest';
import { hasPermission, NAVIGATION_GROUPS, UserRole } from '@/lib/permissions';

describe('Production Authorization & RBAC Navigation Matrix', () => {
  it('ensures admin has access to all navigation modules', () => {
    const adminRole: UserRole = 'admin';
    for (const group of NAVIGATION_GROUPS) {
      for (const item of group.items) {
        expect(hasPermission(item.requiredRoles, adminRole)).toBe(true);
      }
    }
  });

  it('restricts sales agents from accessing settings and collections', () => {
    const agentRole: UserRole = 'sales_agent';
    const settingsItem = NAVIGATION_GROUPS.flatMap((g) => g.items).find((i) => i.id === 'settings');
    const collectionsItem = NAVIGATION_GROUPS.flatMap((g) => g.items).find((i) => i.id === 'collections');

    expect(settingsItem).toBeDefined();
    expect(hasPermission(settingsItem!.requiredRoles, agentRole)).toBe(false);

    expect(collectionsItem).toBeDefined();
    expect(hasPermission(collectionsItem!.requiredRoles, agentRole)).toBe(false);
  });

  it('restricts finance officers from accessing leads and WhatsApp messaging', () => {
    const financeRole: UserRole = 'finance_officer';
    const leadsItem = NAVIGATION_GROUPS.flatMap((g) => g.items).find((i) => i.id === 'leads');
    const whatsappItem = NAVIGATION_GROUPS.flatMap((g) => g.items).find((i) => i.id === 'whatsapp');

    expect(leadsItem).toBeDefined();
    expect(hasPermission(leadsItem!.requiredRoles, financeRole)).toBe(false);

    expect(whatsappItem).toBeDefined();
    expect(hasPermission(whatsappItem!.requiredRoles, financeRole)).toBe(false);
  });

  it('allows auditors read-only access to Audit and Invoices', () => {
    const auditorRole: UserRole = 'auditor';
    const auditItem = NAVIGATION_GROUPS.flatMap((g) => g.items).find((i) => i.id === 'audit');
    const invoicesItem = NAVIGATION_GROUPS.flatMap((g) => g.items).find((i) => i.id === 'invoices');

    expect(auditItem).toBeDefined();
    expect(hasPermission(auditItem!.requiredRoles, auditorRole)).toBe(true);

    expect(invoicesItem).toBeDefined();
    expect(hasPermission(invoicesItem!.requiredRoles, auditorRole)).toBe(true);
  });
});
