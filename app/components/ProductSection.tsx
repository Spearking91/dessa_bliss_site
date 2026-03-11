import { CupSoda, Baby, BottleWine, Package } from "lucide-react";

const products = [
  {
    icon: CupSoda,
    title: "Disposable Cups & Plates",
    description:
      "Strong, hygienic, and convenient for everyday use, events, and food service. Our disposable cups and plates are designed to handle hot and cold meals while making cleanup quick and easy.",
  },
  {
    icon: Package,
    title: "Soft & Durable Tissues",
    description:
      "Gentle on the skin yet highly absorbent, our tissue products are perfect for homes, offices, and public spaces. They deliver comfort, hygiene, and reliability whenever you need them.",
  },
  {
    icon: Baby,
    title: "Comfortable Baby Diapers",
    description:
      "Made with softness and protection in mind, our diapers keep babies dry and comfortable for longer. They provide excellent absorbency and a secure fit for peace of mind for parents.",
  },
  {
    icon: BottleWine,
    title: "Plastic Bottles & Containers",
    description:
      "Practical and durable bottles designed for everyday convenience. Ideal for beverages, storage, and transport, they combine functionality with affordability.",
  },
];

const ProductsSection = () => {
  return (
    <section className="bg-base-200 py-20 px-6 md:px-16">
      <div className="max-w-6xl mx-auto text-center">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold mb-3">What We Sell</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6">
          Our Products
        </h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-14">
          We supply everyday essentials designed to make life easier, cleaner,
          and more convenient. From food packaging solutions to personal hygiene
          products, our range focuses on quality, durability, and affordability
          for homes, businesses, and events.
        </p>

        {/* Product cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-base-100 rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="font-semibold text-lg mb-2">{title}</h3>

              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
