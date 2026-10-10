const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

console.log(`Found ${files.length} migration files.`);

const tableMap = new Map();
const foreignKeys = [];
const rlsTables = new Set();
const functions = new Set();
const triggers = new Set();
const indexes = new Set();
const enums = new Set();

files.forEach(file => {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

  // Find CREATE TABLE
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
  let match;
  while ((match = tableRegex.exec(content)) !== null) {
    const tableName = match[1].toLowerCase();
    const body = match[2];

    if (!tableMap.has(tableName)) {
      tableMap.set(tableName, {
        definedIn: file,
        columns: [],
        hasOrgId: false,
        hasBuId: false,
        rawBody: body,
      });
    }

    const entry = tableMap.get(tableName);
    if (/organization_id/i.test(body)) entry.hasOrgId = true;
    if (/business_unit_id/i.test(body)) entry.hasBuId = true;

    // Parse columns loosely
    const lines = body.split('\n');
    lines.forEach(l => {
      const trimmed = l.trim().replace(/,$/, '');
      if (trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('PRIMARY KEY') && !trimmed.startsWith('FOREIGN KEY') && !trimmed.startsWith('UNIQUE') && !trimmed.startsWith('CONSTRAINT') && !trimmed.startsWith('CHECK')) {
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2 && !/^(PRIMARY|FOREIGN|UNIQUE|CONSTRAINT|CHECK)$/i.test(parts[0])) {
          entry.columns.push({
            name: parts[0],
            type: parts[1],
            line: trimmed
          });
        }
      }
    });
  }

  // Find RLS ENABLE
  const rlsRegex = /ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;
  while ((match = rlsRegex.exec(content)) !== null) {
    rlsTables.add(match[1].toLowerCase());
  }

  // Find functions
  const funcRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([a-zA-Z0-9_]+)/gi;
  while ((match = funcRegex.exec(content)) !== null) {
    functions.add(match[1]);
  }

  // Find triggers
  const trigRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?TRIGGER\s+([a-zA-Z0-9_]+)/gi;
  while ((match = trigRegex.exec(content)) !== null) {
    triggers.add(match[1]);
  }

  // Find indexes
  const idxRegex = /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_]+)/gi;
  while ((match = idxRegex.exec(content)) !== null) {
    indexes.add({ name: match[1], table: match[2].toLowerCase() });
  }
});

console.log(`Discovered ${tableMap.size} unique tables.`);
console.log(`Discovered ${rlsTables.size} tables with RLS enabled.`);
console.log(`Discovered ${functions.size} functions.`);
console.log(`Discovered ${triggers.size} triggers.`);
console.log(`Discovered ${indexes.size} indexes.`);

const categories = {
  IDENTITY: ['organizations', 'business_units', 'users', 'roles', 'permissions', 'role_permissions', 'memberships', 'user_sessions', 'tenant_custom_roles'],
  CRM: ['companies', 'contacts', 'customers', 'leads', 'deals', 'quotes', 'quote_line_items', 'customer_timelines', 'customer_consents', 'sales_flow_instances', 'sales_flow_stage_transitions'],
  ERP: ['invoices', 'invoice_line_items', 'payments', 'payment_links', 'collections_policies', 'collections_actions', 'autonomous_collections_runs', 'erp_products', 'erp_warehouses', 'erp_suppliers', 'erp_inventory_levels', 'erp_stock_movements', 'erp_purchase_orders', 'erp_purchase_order_items', 'erp_external_connector_configs', 'einvoice_transmission_ledger', 'accounting_sync_logs'],
  COMMUNICATIONS: ['conversations', 'messages', 'telephony_configs', 'telephony_queues', 'telephony_phone_numbers', 'telephony_calls', 'telephony_call_sessions', 'telephony_recordings', 'telephony_transcripts', 'telephony_summaries', 'telephony_consent_records', 'telephony_calling_windows', 'telephony_escalations', 'telephony_call_audit_events', 'voice_agent_configs', 'voice_agent_pipelines', 'voice_agent_turns', 'voice_provider_credentials', 'ai_whatsapp_agent_configs', 'ai_whatsapp_sessions', 'ai_whatsapp_support_cases', 'ai_whatsapp_flow_logs', 'support_cases', 'support_case_messages', 'support_case_notes', 'support_case_attachments', 'support_case_audit_events', 'support_tickets'],
  DOCUMENTS: ['documents', 'document_files', 'document_access_logs', 'ocr_extractions', 'ocr_extraction_items', 'ocr_review_queue'],
  WORKFLOWS: ['workflows', 'workflow_steps', 'workflow_executions', 'workflow_execution_logs', 'workflow_events', 'background_tasks', 'cloud_task_executions'],
  AI: ['ai_agents', 'ai_agent_configs', 'ai_agent_runs', 'ai_agent_actions', 'ai_agent_memories', 'ai_tool_definitions', 'ai_tool_executions', 'ai_sales_agent_configs', 'ai_action_receipts'],
  INTEGRATIONS: ['integration_connections', 'integration_sync_logs', 'webhook_events', 'razorpay_events', 'razorpay_orders', 'whatsapp_templates', 'whatsapp_webhooks', 'regional_connectors'],
  SECURITY_AND_AUDIT: ['audit_logs', 'security_audit_events', 'exception_records', 'tenant_settings_and_policies', 'tenant_dnc_suppression_list', 'tenant_retention_schedules', 'command_audit_log', 'audit_provider_probes', 'security_vulnerability_reviews'],
  ANALYTICS_AND_TELEMETRY: ['analytics_snapshots', 'analytics_touchpoint_attributions', 'roi_agent_impact_ledger', 'search_index_entries', 'universal_commands', 'observability_metrics', 'cicd_pipeline_runs', 'cicd_validation_gates', 'cicd_deployments', 'gcp_telemetry_logs', 'e2e_audit_metrics']
};

const categorizedTables = new Set();
const inventoryReport = {};

for (const [cat, expected] of Object.entries(categories)) {
  inventoryReport[cat] = [];
  for (const t of expected) {
    if (tableMap.has(t)) {
      inventoryReport[cat].push(t);
      categorizedTables.add(t);
    }
  }
}

// Find remaining uncategorized tables
const otherTables = [];
for (const [tableName] of tableMap.entries()) {
  if (!categorizedTables.has(tableName)) {
    otherTables.push(tableName);
  }
}
inventoryReport['OTHER_TABLES'] = otherTables;

const output = {
  totalTables: tableMap.size,
  tables: Array.from(tableMap.keys()).sort(),
  tableDetails: Object.fromEntries(Array.from(tableMap.entries()).map(([k, v]) => [k, {
    definedIn: v.definedIn,
    columnsCount: v.columns.length,
    hasOrgId: v.hasOrgId,
    hasBuId: v.hasBuId,
    rlsEnabled: rlsTables.has(k)
  }])),
  rlsTablesCount: rlsTables.size,
  rlsTables: Array.from(rlsTables).sort(),
  functionsCount: functions.size,
  functions: Array.from(functions).sort(),
  indexesCount: indexes.size,
  categories: inventoryReport
};

fs.writeFileSync(path.join(__dirname, 'audit_result.json'), JSON.stringify(output, null, 2));
console.log('Audit complete. Results saved to scripts/audit_result.json');
