import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentPayload {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  paymentMethod: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { paymentId, orderId, userId, amount }: PaymentPayload = await req.json();

    if (!paymentId || !orderId || !userId || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = await import("npm:@supabase/supabase-js").then((mod) =>
      mod.createClient(supabaseUrl, supabaseKey)
    );

    const transactionId = `TXN-${Date.now()}`;

    await supabase
      .from("payments")
      .update({
        status: "success",
        transaction_id: transactionId,
      })
      .eq("id", paymentId);

    await supabase
      .from("orders")
      .update({ status: "confirmed" })
      .eq("id", orderId);

    await supabase
      .from("payment_history")
      .insert({
        payment_id: paymentId,
        status: "success",
        response: { transactionId, timestamp: new Date().toISOString() },
      });

    await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title: "Payment Received",
        message: `We've received your payment of $${amount}. Order confirmation coming soon.`,
        notification_type: "order",
        related_id: orderId,
      });

    return new Response(
      JSON.stringify({
        success: true,
        paymentId,
        transactionId,
        status: "success",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
