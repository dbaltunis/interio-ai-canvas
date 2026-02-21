import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CW_API_BASE = "https://cwglobal.online/api";

/**
 * CW Trade HUB — CORA API order submission
 *
 * The CORA API groups order lines by product_range_id, then by product_type_id + product_material_id.
 * Each item in our quote needs those three IDs mapped (set on the inventory item in Settings > Library).
 *
 * Items missing CW product IDs are collected and sent via the fallback email function.
 */

interface CWOrderItem {
  /** Line item display name / room location (e.g. "Bedroom 1 — Roller Blind") */
  roomLocation: string;
  /** Width in mm */
  widthMm: number;
  /** Height/drop in mm */
  heightMm: number;
  /** CW product range ID (required for API submission) */
  cwProductRangeId?: string;
  /** CW product type ID */
  cwProductTypeId?: string;
  /** CW product material ID */
  cwProductMaterialId?: string;
  /** Measurement type: 'opening sizes' or 'make sizes' */
  measurementType?: 'opening sizes' | 'make sizes';
  /** Additional options specific to this item (passed directly to order_lines) */
  additionalFields?: Record<string, any>;
  /** Notes for this item */
  notes?: string;
  /** Quantity */
  quantity?: number;
}

interface CWSubmitOrderRequest {
  /** Bearer token from the CW Trade HUB company profile */
  apiToken: string;
  /** User's email address registered with CW */
  userEmail: string;
  /** Purchase order reference */
  poNumber?: string;
  /** Order-level notes */
  additionalNotes?: string;
  /** Measurement type for the entire order */
  measurementType?: 'opening sizes' | 'make sizes';
  /** The order items */
  items: CWOrderItem[];
  /** Project ID for recording the submission */
  projectId?: string;
  /** Quote ID for recording the submission */
  quoteId?: string;
  /** Whether this is a test/dry-run (validates structure but may not create a real order) */
  test?: boolean;
  /** Fallback: if true, also send email even when API succeeds */
  alsoSendEmail?: boolean;
  /** For email fallback */
  supplierEmail?: string;
  accountCode?: string;
  accountName?: string;
  contactName?: string;
  contactPhone?: string;
  deliveryAddress?: string;
  paymentTerms?: string;
}

/**
 * Group order items by product_range_id, then by product_type_id + product_material_id.
 * Returns the CORA `import` array structure.
 */
function buildImportArray(items: CWOrderItem[], globalMeasurementType: string) {
  // Group by rangeId
  const byRange = new Map<string, Map<string, { typeId: string; materialId: string; lines: any[] }>>();

  for (const item of items) {
    if (!item.cwProductRangeId || !item.cwProductTypeId || !item.cwProductMaterialId) continue;

    const rangeId = item.cwProductRangeId;
    const key = `${item.cwProductTypeId}:${item.cwProductMaterialId}`;

    if (!byRange.has(rangeId)) byRange.set(rangeId, new Map());
    const rangeMap = byRange.get(rangeId)!;

    if (!rangeMap.has(key)) {
      rangeMap.set(key, {
        typeId: item.cwProductTypeId,
        materialId: item.cwProductMaterialId,
        lines: [],
      });
    }

    const orderLine: Record<string, any> = {
      "room-location": { value: item.roomLocation || "", unconfirmed: false },
      "opening-width": { value: String(item.widthMm), unconfirmed: false },
      "opening-height": { value: String(item.heightMm), unconfirmed: false },
    };

    // Merge any product-specific additional fields
    if (item.additionalFields) {
      Object.assign(orderLine, item.additionalFields);
    }

    if (item.notes) {
      orderLine["notes"] = item.notes;
    }

    // Repeat line for quantity > 1
    const qty = item.quantity ?? 1;
    for (let q = 0; q < qty; q++) {
      rangeMap.get(key)!.lines.push({ ...orderLine });
    }
  }

  // Build import array (one entry per range; each range may have multiple type/material combos)
  const importArray: any[] = [];
  for (const [, rangeMap] of byRange) {
    const combos: any[] = [];
    for (const [, combo] of rangeMap) {
      combos.push({
        product_type_id: combo.typeId,
        product_material_id: combo.materialId,
        order_lines: combo.lines,
      });
    }
    // CORA expects the import array to contain an inner array of combos per range
    importArray.push(combos);
  }

  return importArray;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const body: CWSubmitOrderRequest = await req.json();
    const {
      apiToken,
      userEmail,
      poNumber,
      additionalNotes,
      measurementType = "opening sizes",
      items,
      projectId,
      quoteId,
      test = false,
      alsoSendEmail = false,
      supplierEmail,
      accountCode,
      accountName,
      contactName,
      contactPhone,
      deliveryAddress,
      paymentTerms,
    } = body;

    if (!apiToken) throw new Error("Missing apiToken (Bearer token from CW Trade Hub profile)");
    if (!userEmail) throw new Error("Missing userEmail");
    if (!items || items.length === 0) throw new Error("No order items provided");

    // Separate items: those with CW product IDs (API path) vs those without (email fallback)
    const apiItems = items.filter(i => i.cwProductRangeId && i.cwProductTypeId && i.cwProductMaterialId);
    const emailItems = items.filter(i => !i.cwProductRangeId || !i.cwProductTypeId || !i.cwProductMaterialId);

    let apiResult: { success: boolean; orderId?: string; message?: string; error?: string } = {
      success: false,
    };

    // ─── API SUBMISSION ────────────────────────────────────────────────────────
    if (apiItems.length > 0) {
      // All items must share the same product_range_id for a single API call.
      // Group by range and submit once per range.
      const rangeIds = [...new Set(apiItems.map(i => i.cwProductRangeId!))];

      for (const rangeId of rangeIds) {
        const rangeItems = apiItems.filter(i => i.cwProductRangeId === rangeId);
        const importArray = buildImportArray(rangeItems, measurementType);

        const orderPayload: Record<string, any> = {
          user_email: userEmail,
          product_range_id: rangeId,
          measurements: measurementType,
          "additional-notes": additionalNotes || "",
          purchase_order_number_or_name: poNumber || null,
          "cad-drawing": {
            "not-required-for-approval": "yes",
            "required-prior-to-approval": "no",
          },
          import: importArray,
        };

        console.log(`[CW API] Submitting order for range ${rangeId}:`, JSON.stringify(orderPayload, null, 2));

        if (!test) {
          const cwResponse = await fetch(`${CW_API_BASE}/import/orders`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiToken}`,
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify(orderPayload),
          });

          const cwResponseText = await cwResponse.text();
          let cwResponseJson: any = {};
          try { cwResponseJson = JSON.parse(cwResponseText); } catch { /* not JSON */ }

          console.log(`[CW API] Response status: ${cwResponse.status}`, cwResponseText);

          if (!cwResponse.ok) {
            throw new Error(`CW API error (${cwResponse.status}): ${cwResponseText}`);
          }

          apiResult = {
            success: true,
            orderId: cwResponseJson?.id || cwResponseJson?.order_id || cwResponseJson?.reference,
            message: `Order submitted via CW Trade Hub API (range ${rangeId})`,
          };
        } else {
          // Test mode — validate structure without submitting
          apiResult = {
            success: true,
            message: `[TEST] Order payload validated for range ${rangeId}. ${rangeItems.length} item(s) would be submitted.`,
          };
        }
      }
    }

    // ─── EMAIL FALLBACK ────────────────────────────────────────────────────────
    // Sends email for items missing CW product IDs, or when alsoSendEmail is set
    const shouldSendEmail = emailItems.length > 0 || alsoSendEmail;
    if (shouldSendEmail && supplierEmail) {
      const emailOrderData = {
        supplierEmail,
        accountCode: accountCode || "",
        accountName: accountName || "",
        contactName: contactName || "",
        contactPhone: contactPhone || "",
        deliveryAddress: deliveryAddress || "",
        paymentTerms: paymentTerms || "Account 30 Days",
        poNumber: poNumber || "",
        notes: [
          additionalNotes,
          emailItems.length > 0 ? `⚠️ ${emailItems.length} item(s) below could not be submitted via API (missing CW product IDs) — please process manually.` : "",
        ].filter(Boolean).join("\n\n"),
        items: (alsoSendEmail ? items : emailItems).map(item => ({
          description: item.roomLocation,
          width: `${item.widthMm}mm`,
          drop: `${item.heightMm}mm`,
          notes: item.notes || "",
          quantity: item.quantity || 1,
        })),
      };

      await supabase.functions.invoke("send-supplier-order-email", {
        body: {
          supplier: "cw_systems",
          test,
          orderData: emailOrderData,
          projectId,
        },
      });
    }

    // ─── RECORD SUBMISSION ─────────────────────────────────────────────────────
    if (projectId && !test) {
      const { data: project } = await supabase
        .from("projects")
        .select("supplier_orders")
        .eq("id", projectId)
        .single();

      const existingOrders = (project as any)?.supplier_orders || {};
      existingOrders["cw_systems"] = {
        status: "submitted",
        submitted_at: new Date().toISOString(),
        submitted_method: apiItems.length > 0 ? "api" : "email",
        api_order_id: apiResult.orderId || null,
        api_items_count: apiItems.length,
        email_fallback_items_count: emailItems.length,
        is_test: test,
      };

      await supabase
        .from("projects")
        .update({ supplier_orders: existingOrders } as any)
        .eq("id", projectId);
    }

    const summary = [
      apiItems.length > 0
        ? `${apiItems.length} item(s) submitted via CW Trade Hub API${apiResult.orderId ? ` (Order ID: ${apiResult.orderId})` : ""}`
        : null,
      emailItems.length > 0
        ? `${emailItems.length} item(s) sent via email (missing CW product mapping)`
        : null,
      alsoSendEmail && apiItems.length > 0
        ? "Email copy also sent"
        : null,
    ].filter(Boolean).join("; ");

    return new Response(
      JSON.stringify({
        success: true,
        message: test ? `[TEST] ${summary}` : summary,
        apiOrderId: apiResult.orderId || null,
        apiItemsSubmitted: apiItems.length,
        emailItemsSent: emailItems.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[CW API] Order submission error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to submit CW order" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
