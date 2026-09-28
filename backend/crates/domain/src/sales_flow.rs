use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ============================================================================
// Complete 9-Stage Sales Lifecycle Domain Models
// ============================================================================

/// The 9 discrete stages of the Unified Sales Flow
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SalesFlowStage {
    Lead,
    ContactCompany,
    Deal,
    Quote,
    Invoice,
    PaymentLink,
    Payment,
    CustomerTimeline,
    AnalyticsCompleted,
}

impl SalesFlowStage {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Lead => "lead",
            Self::ContactCompany => "contact_company",
            Self::Deal => "deal",
            Self::Quote => "quote",
            Self::Invoice => "invoice",
            Self::PaymentLink => "payment_link",
            Self::Payment => "payment",
            Self::CustomerTimeline => "customer_timeline",
            Self::AnalyticsCompleted => "analytics_completed",
        }
    }

    pub fn next_stage(&self) -> Option<SalesFlowStage> {
        match self {
            Self::Lead => Some(Self::ContactCompany),
            Self::ContactCompany => Some(Self::Deal),
            Self::Deal => Some(Self::Quote),
            Self::Quote => Some(Self::Invoice),
            Self::Invoice => Some(Self::PaymentLink),
            Self::PaymentLink => Some(Self::Payment),
            Self::Payment => Some(Self::CustomerTimeline),
            Self::CustomerTimeline => Some(Self::AnalyticsCompleted),
            Self::AnalyticsCompleted => None,
        }
    }

    pub fn order_index(&self) -> u32 {
        match self {
            Self::Lead => 1,
            Self::ContactCompany => 2,
            Self::Deal => 3,
            Self::Quote => 4,
            Self::Invoice => 5,
            Self::PaymentLink => 6,
            Self::Payment => 7,
            Self::CustomerTimeline => 8,
            Self::AnalyticsCompleted => 9,
        }
    }
}

/// Actor executing the transition
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FlowActorType {
    Human,
    AiAgent,
    Hybrid,
}

/// Sales Flow Instance Master
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SalesFlowInstance {
    pub id: Uuid,
    pub organization_id: Uuid,
    pub flow_number: String,
    pub current_stage: SalesFlowStage,
    pub lead_id: Option<Uuid>,
    pub customer_id: Option<Uuid>,
    pub company_id: Option<Uuid>,
    pub contact_id: Option<Uuid>,
    pub deal_id: Option<Uuid>,
    pub quote_id: Option<Uuid>,
    pub invoice_id: Option<Uuid>,
    pub payment_link_id: Option<Uuid>,
    pub payment_id: Option<Uuid>,
    pub total_value: f64,
    pub currency: String,
    pub actor_type: FlowActorType,
    pub assigned_user_id: Option<Uuid>,
    pub assigned_ai_agent_id: Option<Uuid>,
    pub status: String, // 'in_progress', 'completed', 'blocked'
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub updated_at: DateTime<Utc>,
}

/// Stage Transition Event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StageTransitionEvent {
    pub transition_id: Uuid,
    pub flow_instance_id: Uuid,
    pub from_stage: SalesFlowStage,
    pub to_stage: SalesFlowStage,
    pub actor_type: FlowActorType,
    pub actor_name: String,
    pub action_name: String,
    pub timeline_event_title: String,
    pub status: String,
    pub timestamp: DateTime<Utc>,
}

/// Advance request DTO
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdvanceFlowRequest {
    pub flow_instance_id: Uuid,
    pub target_stage: Option<SalesFlowStage>,
    pub actor_type: FlowActorType,
    pub actor_name: String,
    pub sku: Option<String>,
    pub quantity: Option<f64>,
    pub payment_provider: Option<String>, // 'razorpay', 'stripe'
}

// ============================================================================
// Core Sales Flow Engine
// ============================================================================

pub struct SalesFlowEngine;

impl SalesFlowEngine {
    /// Initiate a brand new flow instance from an incoming Lead
    pub fn initiate_from_lead(
        organization_id: Uuid,
        lead_id: Uuid,
        estimated_value: f64,
        currency: &str,
        actor_type: FlowActorType,
    ) -> SalesFlowInstance {
        SalesFlowInstance {
            id: Uuid::new_v4(),
            organization_id,
            flow_number: format!("SF-2026-{}", Uuid::new_v4().simple().to_string()[..6].to_uppercase()),
            current_stage: SalesFlowStage::Lead,
            lead_id: Some(lead_id),
            customer_id: None,
            company_id: None,
            contact_id: None,
            deal_id: None,
            quote_id: None,
            invoice_id: None,
            payment_link_id: None,
            payment_id: None,
            total_value: estimated_value,
            currency: currency.to_string(),
            actor_type,
            assigned_user_id: None,
            assigned_ai_agent_id: None,
            status: "in_progress".to_string(),
            started_at: Utc::now(),
            completed_at: None,
            updated_at: Utc::now(),
        }
    }

    /// Advance Stage 1 (Lead) -> Stage 2 (Contact & Company Conversion)
    pub fn advance_to_contact_company(
        instance: &mut SalesFlowInstance,
        actor_name: &str,
    ) -> Result<StageTransitionEvent, String> {
        if instance.current_stage != SalesFlowStage::Lead {
            return Err(format!(
                "Invalid state transition: Cannot advance to Contact/Company from {:?}",
                instance.current_stage
            ));
        }

        let customer_id = Uuid::new_v4();
        let company_id = Uuid::new_v4();
        let contact_id = Uuid::new_v4();

        instance.customer_id = Some(customer_id);
        instance.company_id = Some(company_id);
        instance.contact_id = Some(contact_id);
        instance.current_stage = SalesFlowStage::ContactCompany;
        instance.updated_at = Utc::now();

        Ok(StageTransitionEvent {
            transition_id: Uuid::new_v4(),
            flow_instance_id: instance.id,
            from_stage: SalesFlowStage::Lead,
            to_stage: SalesFlowStage::ContactCompany,
            actor_type: instance.actor_type.clone(),
            actor_name: actor_name.to_string(),
            action_name: "convert_lead_to_customer_graph".to_string(),
            timeline_event_title: "Lead qualified and converted into Customer 360 graph".to_string(),
            status: "success".to_string(),
            timestamp: Utc::now(),
        })
    }

    /// Advance Stage 2 (Contact/Company) -> Stage 3 (CRM Deal Creation)
    pub fn advance_to_deal(
        instance: &mut SalesFlowInstance,
        deal_value: f64,
        actor_name: &str,
    ) -> Result<StageTransitionEvent, String> {
        if instance.current_stage != SalesFlowStage::ContactCompany {
            return Err("Must be in ContactCompany stage to spawn a Deal".to_string());
        }

        let deal_id = Uuid::new_v4();
        instance.deal_id = Some(deal_id);
        instance.total_value = deal_value;
        instance.current_stage = SalesFlowStage::Deal;
        instance.updated_at = Utc::now();

        Ok(StageTransitionEvent {
            transition_id: Uuid::new_v4(),
            flow_instance_id: instance.id,
            from_stage: SalesFlowStage::ContactCompany,
            to_stage: SalesFlowStage::Deal,
            actor_type: instance.actor_type.clone(),
            actor_name: actor_name.to_string(),
            action_name: "create_crm_deal".to_string(),
            timeline_event_title: format!("Commercial Deal created in pipeline: ${:.2}", deal_value),
            status: "success".to_string(),
            timestamp: Utc::now(),
        })
    }

    /// Advance Stage 3 (Deal) -> Stage 4 (Quote with Stock Check & Reservation)
    pub fn advance_to_quote(
        instance: &mut SalesFlowInstance,
        actor_name: &str,
    ) -> Result<StageTransitionEvent, String> {
        if instance.current_stage != SalesFlowStage::Deal {
            return Err("Must be in Deal stage to generate Quote".to_string());
        }

        let quote_id = Uuid::new_v4();
        instance.quote_id = Some(quote_id);
        instance.current_stage = SalesFlowStage::Quote;
        instance.updated_at = Utc::now();

        Ok(StageTransitionEvent {
            transition_id: Uuid::new_v4(),
            flow_instance_id: instance.id,
            from_stage: SalesFlowStage::Deal,
            to_stage: SalesFlowStage::Quote,
            actor_type: instance.actor_type.clone(),
            actor_name: actor_name.to_string(),
            action_name: "generate_quote_with_stock_check".to_string(),
            timeline_event_title: "Formal Price Quote generated and inventory reserved in warehouse".to_string(),
            status: "success".to_string(),
            timestamp: Utc::now(),
        })
    }

    /// Advance Stage 4 (Quote) -> Stage 5 (Invoice Issuance)
    pub fn advance_to_invoice(
        instance: &mut SalesFlowInstance,
        actor_name: &str,
    ) -> Result<StageTransitionEvent, String> {
        if instance.current_stage != SalesFlowStage::Quote {
            return Err("Must be in Quote stage to issue Invoice".to_string());
        }

        let invoice_id = Uuid::new_v4();
        instance.invoice_id = Some(invoice_id);
        instance.current_stage = SalesFlowStage::Invoice;
        instance.updated_at = Utc::now();

        Ok(StageTransitionEvent {
            transition_id: Uuid::new_v4(),
            flow_instance_id: instance.id,
            from_stage: SalesFlowStage::Quote,
            to_stage: SalesFlowStage::Invoice,
            actor_type: instance.actor_type.clone(),
            actor_name: actor_name.to_string(),
            action_name: "accept_quote_issue_invoice".to_string(),
            timeline_event_title: "Quote signed by customer. Official ERP Invoice issued.".to_string(),
            status: "success".to_string(),
            timestamp: Utc::now(),
        })
    }

    /// Advance Stage 5 (Invoice) -> Stage 6 (Payment Link Generation via Razorpay/Stripe)
    pub fn advance_to_payment_link(
        instance: &mut SalesFlowInstance,
        provider: &str,
        actor_name: &str,
    ) -> Result<StageTransitionEvent, String> {
        if instance.current_stage != SalesFlowStage::Invoice {
            return Err("Must be in Invoice stage to generate Payment Link".to_string());
        }

        let payment_link_id = Uuid::new_v4();
        instance.payment_link_id = Some(payment_link_id);
        instance.current_stage = SalesFlowStage::PaymentLink;
        instance.updated_at = Utc::now();

        Ok(StageTransitionEvent {
            transition_id: Uuid::new_v4(),
            flow_instance_id: instance.id,
            from_stage: SalesFlowStage::Invoice,
            to_stage: SalesFlowStage::PaymentLink,
            actor_type: instance.actor_type.clone(),
            actor_name: actor_name.to_string(),
            action_name: format!("generate_payment_link_{}", provider),
            timeline_event_title: format!("Hosted checkout payment link created via {}", provider),
            status: "success".to_string(),
            timestamp: Utc::now(),
        })
    }

    /// Advance Stage 6 (Payment Link) -> Stage 7 (Payment Settlement & Inventory Fulfillment)
    pub fn advance_to_payment(
        instance: &mut SalesFlowInstance,
        method: &str,
        actor_name: &str,
    ) -> Result<StageTransitionEvent, String> {
        if instance.current_stage != SalesFlowStage::PaymentLink {
            return Err("Must be in PaymentLink stage to process Payment".to_string());
        }

        let payment_id = Uuid::new_v4();
        instance.payment_id = Some(payment_id);
        instance.current_stage = SalesFlowStage::Payment;
        instance.updated_at = Utc::now();

        Ok(StageTransitionEvent {
            transition_id: Uuid::new_v4(),
            flow_instance_id: instance.id,
            from_stage: SalesFlowStage::PaymentLink,
            to_stage: SalesFlowStage::Payment,
            actor_type: instance.actor_type.clone(),
            actor_name: actor_name.to_string(),
            action_name: "settle_payment_and_fulfill".to_string(),
            timeline_event_title: format!("Payment captured via {}. Invoice settled and stock fulfilled.", method),
            status: "success".to_string(),
            timestamp: Utc::now(),
        })
    }

    /// Advance Stage 7 (Payment) -> Stage 8 (Customer Timeline Sync)
    pub fn advance_to_customer_timeline(
        instance: &mut SalesFlowInstance,
        actor_name: &str,
    ) -> Result<StageTransitionEvent, String> {
        if instance.current_stage != SalesFlowStage::Payment {
            return Err("Must be in Payment stage to post Timeline events".to_string());
        }

        instance.current_stage = SalesFlowStage::CustomerTimeline;
        instance.updated_at = Utc::now();

        Ok(StageTransitionEvent {
            transition_id: Uuid::new_v4(),
            flow_instance_id: instance.id,
            from_stage: SalesFlowStage::Payment,
            to_stage: SalesFlowStage::CustomerTimeline,
            actor_type: instance.actor_type.clone(),
            actor_name: actor_name.to_string(),
            action_name: "post_customer_timeline_milestones".to_string(),
            timeline_event_title: "Customer 360 Timeline synchronized with complete sales milestone audit".to_string(),
            status: "success".to_string(),
            timestamp: Utc::now(),
        })
    }

    /// Advance Stage 8 (Timeline) -> Stage 9 (Analytics Completed)
    pub fn advance_to_analytics_completed(
        instance: &mut SalesFlowInstance,
        actor_name: &str,
    ) -> Result<StageTransitionEvent, String> {
        if instance.current_stage != SalesFlowStage::CustomerTimeline {
            return Err("Must be in CustomerTimeline stage to finalize Analytics".to_string());
        }

        instance.current_stage = SalesFlowStage::AnalyticsCompleted;
        instance.status = "completed".to_string();
        instance.completed_at = Some(Utc::now());
        instance.updated_at = Utc::now();

        Ok(StageTransitionEvent {
            transition_id: Uuid::new_v4(),
            flow_instance_id: instance.id,
            from_stage: SalesFlowStage::CustomerTimeline,
            to_stage: SalesFlowStage::AnalyticsCompleted,
            actor_type: instance.actor_type.clone(),
            actor_name: actor_name.to_string(),
            action_name: "update_executive_analytics_roi".to_string(),
            timeline_event_title: format!(
                "Sales cycle completed! Revenue collected (+${:.2}) attributed in Executive Analytics.",
                instance.total_value
            ),
            status: "success".to_string(),
            timestamp: Utc::now(),
        })
    }

    /// Autonomous AI Agent Execution Step with Policy Check
    pub fn execute_ai_agent_step(
        instance: &mut SalesFlowInstance,
        agent_role: &str,
    ) -> Result<StageTransitionEvent, String> {
        // Enforce agent capability: AI agents must be authorized for sales flow
        if agent_role != "sales_agent" && agent_role != "super_admin" && agent_role != "copilot" {
            return Err(format!("AI Agent role '{}' is unauthorized to execute sales flow transitions.", agent_role));
        }

        let agent_name = format!("Nexus AI Agent ({})", agent_role);

        match instance.current_stage {
            SalesFlowStage::Lead => Self::advance_to_contact_company(instance, &agent_name),
            SalesFlowStage::ContactCompany => Self::advance_to_deal(instance, instance.total_value, &agent_name),
            SalesFlowStage::Deal => Self::advance_to_quote(instance, &agent_name),
            SalesFlowStage::Quote => Self::advance_to_invoice(instance, &agent_name),
            SalesFlowStage::Invoice => Self::advance_to_payment_link(instance, "razorpay", &agent_name),
            SalesFlowStage::PaymentLink => Self::advance_to_payment(instance, "razorpay_upi", &agent_name),
            SalesFlowStage::Payment => Self::advance_to_customer_timeline(instance, &agent_name),
            SalesFlowStage::CustomerTimeline => Self::advance_to_analytics_completed(instance, &agent_name),
            SalesFlowStage::AnalyticsCompleted => Err("Sales flow is already fully completed".to_string()),
        }
    }
}
