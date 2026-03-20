import { createServerSupabaseClient } from "@/lib/supabase/server";

type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | string;

const ACTIVE_STATUSES = new Set<SubscriptionStatus>(["active", "trialing"]);

function isFutureDate(date: string | null) {
  if (!date) return false;
  return new Date(date).getTime() > Date.now();
}

export async function getCurrentUserId() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export async function getActiveSubscription(userId?: string | null) {
  const resolvedUserId = userId ?? (await getCurrentUserId());
  if (!resolvedUserId) return null;

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", resolvedUserId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const hasActiveStatus = ACTIVE_STATUSES.has(data.status);
  const hasValidPeriod =
    !data.current_period_end || isFutureDate(data.current_period_end);

  if (!hasActiveStatus || !hasValidPeriod) {
    return null;
  }

  return data;
}

export async function userOwnsTemplate(
  templateId: string,
  userId?: string | null
) {
  const resolvedUserId = userId ?? (await getCurrentUserId());
  if (!resolvedUserId) return false;

  const supabase = await createServerSupabaseClient();

  // 1. Vérifie d'abord entitlements si tu continues à l'utiliser
  const { data: entitlementData, error: entitlementError } = await supabase
    .from("entitlements")
    .select("id")
    .eq("user_id", resolvedUserId)
    .eq("template_id", templateId)
    .eq("is_active", true)
    .or("access_end.is.null,access_end.gt.now()")
    .maybeSingle();

  if (!entitlementError && entitlementData) {
    return true;
  }

  // 2. Vérifie ensuite les achats unitaires via orders + order_items
  const { data: orderItemData, error: orderItemError } = await supabase
    .from("order_items")
    .select(`
      id,
      order_id,
      orders!inner (
        id,
        user_id,
        status
      )
    `)
    .eq("template_id", templateId)
    .eq("orders.user_id", resolvedUserId)
    .eq("orders.status", "paid")
    .limit(1)
    .maybeSingle();

  if (orderItemError) return false;

  return !!orderItemData;
}

export async function userHasActiveSubscription(userId?: string | null) {
  const subscription = await getActiveSubscription(userId);
  return !!subscription;
}

export async function userHasAccessToTemplate(
  templateId: string,
  userId?: string | null
) {
  const resolvedUserId = userId ?? (await getCurrentUserId());
  if (!resolvedUserId) return false;

  const hasSubscription = await userHasActiveSubscription(resolvedUserId);
  if (hasSubscription) return true;

  const ownsTemplate = await userOwnsTemplate(templateId, resolvedUserId);
  return ownsTemplate;
}

export async function getOwnedTemplates(userId?: string | null) {
  const resolvedUserId = userId ?? (await getCurrentUserId());
  if (!resolvedUserId) return [];

  const supabase = await createServerSupabaseClient();

  // Templates via entitlements
  const { data: entitlementTemplates } = await supabase
    .from("entitlements")
    .select(`
      template_id,
      templates (
        id,
        slug,
        title,
        short_description,
        category,
        tags,
        is_published
      )
    `)
    .eq("user_id", resolvedUserId)
    .eq("is_active", true);

  // Templates via achats unitaires
  const { data: purchasedTemplates } = await supabase
    .from("order_items")
    .select(`
      template_id,
      templates (
        id,
        slug,
        title,
        short_description,
        category,
        tags,
        is_published
      ),
      orders!inner (
        id,
        user_id,
        status
      )
    `)
    .eq("orders.user_id", resolvedUserId)
    .eq("orders.status", "paid");

  const entitlementList = entitlementTemplates ?? [];
  const purchasedList = purchasedTemplates ?? [];

  const mergedMap = new Map<string, any>();

  for (const item of entitlementList) {
    const template = Array.isArray(item.templates)
      ? item.templates[0]
      : item.templates;

    if (template?.id) {
      mergedMap.set(template.id, template);
    }
  }

  for (const item of purchasedList) {
    const template = Array.isArray(item.templates)
      ? item.templates[0]
      : item.templates;

    if (template?.id) {
      mergedMap.set(template.id, template);
    }
  }

  return Array.from(mergedMap.values());
}