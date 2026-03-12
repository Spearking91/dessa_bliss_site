import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers are required for client-side fetch requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Ensure the request is a POST request
    if (req.method !== "POST") {
      throw new Error("Method Not Allowed");
    }

    const { reference } = await req.json();
    if (!reference) {
      throw new Error("Payment reference is required.");
    }

    const paystackKey = Deno.env.get("NEXT_PRIVATE_PAYSTACK_SECRET");
    if (!paystackKey) {
      throw new Error("Paystack secret key is not configured.");
    }

    // 1. Verify with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${paystackKey}` },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Paystack API error: ${response.status} - ${errorText}`);
    }

    const paystackData = await response.json();

    if (paystackData.data.status === "success") {
      // 2. Initialize Supabase Client with Admin Key to bypass RLS
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      // 3. Update the database
      const { error: dbError } = await supabase
        .from("payments")
        .update({ status: "success" })
        .eq("reference", reference);

      if (dbError) {
        throw new Error(`Database update failed: ${dbError.message}`);
      }

      return new Response(JSON.stringify({ verified: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Payment not successful on Paystack.");
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, verified: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
