import { useState } from "react";

import { Store, CreditCard, Truck } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";

const AdminSettings = () => {
  const { showToast } = useToast();
  const [storeSettings, setStoreSettings] = useState({
    name: "My E-Commerce Store",
    email: "store@example.com",
    currency: "USD",
    taxRate: "7.5",
  });

  const handleSave = () => {
    showToast("Settings saved", "success", "Your settings have been updated.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your store</p>
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="tabs tabs-boxed">
          <TabsTrigger
            value="store"
            className="tab data-[state=active]:tab-active"
          >
            <Store className="h-4 w-4 mr-2" />
            Store
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="tab data-[state=active]:tab-active"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="tab data-[state=active]:tab-active"
          >
            <Truck className="h-4 w-4 mr-2" />
            Shipping
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="mt-4">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h3 className="card-title">Store Information</h3>
              <p className="text-sm text-base-content/70">
                Basic details about your store
              </p>

              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Store Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={storeSettings.name}
                    onChange={(e) =>
                      setStoreSettings((s) => ({ ...s, name: e.target.value }))
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Store Email</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered"
                    value={storeSettings.email}
                    onChange={(e) =>
                      setStoreSettings((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Currency</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={storeSettings.currency}
                    onChange={(e) =>
                      setStoreSettings((s) => ({
                        ...s,
                        currency: e.target.value,
                      }))
                    }
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="NGN">NGN (₦)</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tax Rate (%)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={storeSettings.taxRate}
                    onChange={(e) =>
                      setStoreSettings((s) => ({
                        ...s,
                        taxRate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="mt-4">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h3 className="card-title">Payment Configuration</h3>
              <p className="text-sm text-base-content/70">
                Paystack integration settings
              </p>
              <p className="mt-4">
                Payment is handled via Paystack. Configure your Paystack keys in
                the Supabase secrets panel.
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-4">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h3 className="card-title">Shipping Settings</h3>
              <p className="text-sm text-base-content/70">
                Configure shipping options
              </p>
              <p className="mt-4">
                Shipping configuration will be available once you set up
                shipping providers.
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
