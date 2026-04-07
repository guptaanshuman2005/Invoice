import express from "express";
import { createServer as createViteServer } from "vite";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

console.log("Starting server.ts...");

dotenv.config();

console.log("Config loaded. Initializing Cashfree...");

const cashfree = new Cashfree(
  process.env.CASHFREE_ENVIRONMENT === "PRODUCTION" 
    ? CFEnvironment.PRODUCTION 
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID || "",
  process.env.CASHFREE_SECRET_KEY || ""
);

console.log("Initializing Supabase...");

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Supabase client initialized.");
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
} else {
  console.warn("Supabase keys missing. Webhooks will not work correctly.");
}

async function startServer() {
  console.log("In startServer()...");
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // Use JSON parser for all routes
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  console.log("Registering API routes...");

  app.post("/api/create-cashfree-order", async (req, res) => {
    try {
      const { plan, companyId, customerPhone, customerEmail, customerName } = req.body;
      
      let amount = 0;
      if (plan === "basic") amount = 199;
      else if (plan === "standard") amount = 499;
      else if (plan === "premium") amount = 1499;
      else if (plan === "addon_50") amount = 99;
      else if (plan === "addon_200") amount = 299;
      else if (plan === "addon_500") amount = 499;

      if (amount === 0) {
        return res.status(400).json({ error: "Invalid plan" });
      }

      const orderId = `order_${companyId}_${Date.now()}`;

      const request = {
        order_amount: amount,
        order_currency: "INR",
        order_id: orderId,
        customer_details: {
          customer_id: companyId,
          customer_phone: customerPhone || "9999999999",
          customer_email: customerEmail || "test@example.com",
          customer_name: customerName || "Customer",
        },
        order_meta: {
          return_url: `${process.env.APP_URL || 'http://localhost:3000'}?order_id={order_id}`,
          notify_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/cashfree-webhook`,
        },
        order_tags: {
          plan,
          companyId,
        },
      };

      const response = await cashfree.PGCreateOrder(request);
      
      res.json({ 
        payment_session_id: response.data.payment_session_id,
        order_id: response.data.order_id
      });
    } catch (error: any) {
      console.error("Cashfree error:", error.response?.data || error);
      res.status(500).json({ error: error.message || "Failed to create order" });
    }
  });

  // Cashfree Webhook
  app.post('/api/cashfree-webhook', async (req, res) => {
    try {
      cashfree.PGVerifyWebhookSignature(
        req.headers["x-webhook-signature"] as string,
        JSON.stringify(req.body),
        req.headers["x-webhook-timestamp"] as string
      );
    } catch (err: any) {
      console.error(`Webhook Signature Verification Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const event = req.body;

    // Handle the event
    if (event.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const orderTags = event.data?.order?.order_tags;
      const companyId = orderTags?.companyId;
      const plan = orderTags?.plan as string;
      
      if (companyId && plan) {
        // Fetch the current company data
        const { data: companyData, error: fetchError } = await supabase
          .from('companies')
          .select('data')
          .eq('id', companyId)
          .single();

        if (fetchError) {
          console.error('Error fetching company:', fetchError);
        } else if (companyData) {
          const company = companyData.data;
          
          if (plan.startsWith('addon_')) {
             const extraInvoices = parseInt(plan.split('_')[1]);
             if (!company.subscription) {
                 company.subscription = {
                     plan: 'free',
                     status: 'active',
                     currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
                     invoiceCount: 0,
                     invoiceLimit: 10,
                     addonInvoices: extraInvoices
                 };
             } else {
                 company.subscription.addonInvoices = (company.subscription.addonInvoices || 0) + extraInvoices;
             }
          } else {
              const invoiceLimit = plan === 'basic' ? 50 : plan === 'standard' ? 100 : 300;
              const currentPeriodEnd = new Date();
              if (plan === 'basic') currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
              else if (plan === 'standard') currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
              else if (plan === 'premium') currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);

              company.subscription = {
                plan,
                status: 'active',
                currentPeriodEnd: currentPeriodEnd.toISOString(),
                invoiceCount: 0,
                invoiceLimit,
                addonInvoices: company.subscription?.addonInvoices || 0,
              };
          }

          const { error: updateError } = await supabase
            .from('companies')
            .update({ data: company })
            .eq('id', companyId);

          if (updateError) {
            console.error('Error updating company subscription:', updateError);
          } else {
            console.log('Successfully updated subscription for company:', companyId);
          }
        }
      }
    }

    res.send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite in development mode...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware initialized.");
    } catch (err) {
      console.error("Vite initialization failed:", err);
    }
  } else {
    console.log("Running in production mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

console.log("Calling startServer()...");
startServer().catch(err => {
  console.error("Failed to start server:", err);
});
