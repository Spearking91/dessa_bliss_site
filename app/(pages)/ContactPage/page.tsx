"use client";
import Toast from "@/app/components/toast";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    <Toast
      title="Message sent!"
      description="We'll get back to you as soon as possible."
    />;
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen px-20">
      {/* Hero */}
      <section className="bg-muted py-12">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Info cards */}
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "support@altershop.com" },
              { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
              {
                icon: MapPin,
                label: "Address",
                value: "123 Commerce St, Lagos, Nigeria",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                placeholder="Your name"
                className="w-full input input-neutral p-5"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
              <input
                type="email"
                className="w-full input input-neutral p-5"
                placeholder="Your email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </div>
            <input
              className="w-full input input-neutral p-5"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) =>
                setForm((f) => ({ ...f, subject: e.target.value }))
              }
              required
            />
            <textarea
              className="textarea textarea-neutral w-full"
              placeholder="Your message"
              rows={6}
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              required
            />
            <button type="submit" className="btn btn-primary">
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
