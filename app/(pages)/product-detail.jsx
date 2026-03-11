import React, { useState } from 'react';
import { Heart, Share2, Star, ChevronLeft, Check, Truck, Shield, RotateCcw, Plus, Minus } from 'lucide-react';

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [selectedColor, setSelectedColor] = useState('Natural');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const product = {
    id: 1,
    name: "Minimal Ceramic Vase",
    price: 89,
    originalPrice: 129,
    discount: 31,
    rating: 4.8,
    reviews: 127,
    category: "Home Decor",
    inStock: true,
    description: "A handcrafted ceramic vase that brings organic elegance to any space. Each piece is unique, featuring subtle variations in glaze that make it truly one-of-a-kind.",
    features: [
      "Handmade by artisan ceramicists",
      "Food-safe ceramic with waterproof interior",
      "Unique glaze variations on each piece",
      "Sustainable production methods"
    ],
    materials: "High-fired stoneware clay with natural glaze",
    care: "Wipe clean with damp cloth. Not dishwasher safe.",
    images: [
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1578500494549-38f95cbd4df7?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"
    ]
  };

  const sizes = ['Small', 'Medium', 'Large'];
  const colors = ['Natural', 'White', 'Charcoal', 'Terracotta'];

  const relatedProducts = [
    {
      id: 2,
      name: "Ceramic Bowl Set",
      price: 65,
      image: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=400&h=500&fit=crop"
    },
    {
      id: 3,
      name: "Stoneware Plate",
      price: 45,
      image: "https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=400&h=500&fit=crop"
    },
    {
      id: 4,
      name: "Clay Planter",
      price: 38,
      image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=500&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
              <ChevronLeft size={20} />
              <span className="text-sm">Back to Shop</span>
            </button>
            <h1 className="text-2xl font-bold">ARIA</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
              <img 
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 text-sm font-bold">
                  -{product.discount}%
                </div>
              )}
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:scale-110 transition-transform"
              >
                <Heart 
                  size={20} 
                  className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"}
                />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-50 overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-black' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={image}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm text-gray-500 uppercase tracking-wide">{product.category}</span>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        size={16}
                        className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-3xl font-bold">${product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-xl text-gray-400 line-through">${product.originalPrice}</span>
                )}
              </div>

              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                product.inStock 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>

            {/* Size Selection */}
            <div>
              <h3 className="font-medium mb-3">Size</h3>
              <div className="flex gap-3">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 border-2 transition-all ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-medium mb-3">Color: {selectedColor}</h3>
              <div className="flex gap-3">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-black scale-110'
                        : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: 
                        color === 'Natural' ? '#D4C5B9' :
                        color === 'White' ? '#FFFFFF' :
                        color === 'Charcoal' ? '#36454F' :
                        '#E07A5F'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-black text-white py-4 px-8 text-lg font-medium hover:bg-gray-800 transition-all transform hover:scale-[1.02]">
                Add to Cart
              </button>
              <button className="w-full border-2 border-black text-black py-4 px-8 text-lg font-medium hover:bg-black hover:text-white transition-all">
                Buy Now
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <Share2 size={18} />
                Share this product
              </button>
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-8 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Truck className="mx-auto mb-2 text-gray-600" size={24} />
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-gray-500">On orders over $50</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="mx-auto mb-2 text-gray-600" size={24} />
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-gray-500">30-day policy</p>
                </div>
                <div className="text-center">
                  <Shield className="mx-auto mb-2 text-gray-600" size={24} />
                  <p className="text-sm font-medium">Secure Payment</p>
                  <p className="text-xs text-gray-500">100% protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-20 border-t border-gray-200">
          <div className="py-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Features</h2>
              <ul className="space-y-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-3">Materials</h3>
                <p className="text-gray-600">{product.materials}</p>
              </div>
              <div>
                <h3 className="font-bold mb-3">Care Instructions</h3>
                <p className="text-gray-600">{product.care}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map(item => (
              <div key={item.id} className="group cursor-pointer">
                <div className="aspect-[3/4] bg-gray-50 mb-3 overflow-hidden">
                  <img 
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-medium mb-1">{item.name}</h3>
                <p className="text-lg font-bold">${item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,700;1,300&display=swap');
        
        * {
          font-family: 'Crimson Pro', serif;
        }
      `}</style>
    </div>
  );
}
