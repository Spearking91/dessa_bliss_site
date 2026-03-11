import { ShieldCheck, Truck, Headphones, Heart } from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Quality Guaranteed",
    description:
      "Every product is carefully vetted to meet our high standards before it reaches you.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "We partner with reliable carriers to get your orders to you as quickly as possible.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Our dedicated team is always here to help with any questions or concerns.",
  },
  {
    icon: Heart,
    title: "Customer First",
    description:
      "Your satisfaction drives everything we do — from product selection to after-sales care.",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-base-300 px-20">
      {/* Hero */}
      <section className="bg-muted py-16">
        <div className="container max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            About Altershop
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We're on a mission to make quality products accessible to everyone.
            Founded with a passion for great design and fair pricing, Altershop
            has grown into a trusted destination for thousands of happy
            customers.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              Altershop started in 2023 with a simple idea: bring together the
              best products from around the world under one roof, and offer them
              at honest prices with exceptional service.
            </p>
            <p className="text-muted-foreground">
              Today we serve customers across multiple regions, continually
              expanding our catalog while staying true to our founding
              principles of quality, transparency, and customer satisfaction.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
              alt="Our team collaborating"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-10">
            What We Stand For
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-card rounded-xl p-6 text-center shadow-sm"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
