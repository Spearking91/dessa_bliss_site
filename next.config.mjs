/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/admin/login',
        destination: '/admin/AdminLoginPage',
      },
      {
        source: '/admin',
        destination: '/admin/AdminDashboard',
      },
      {
        source: '/admin/products',
        destination: '/admin/AdminProducts',
      },
      {
        source: '/admin/orders',
        destination: '/admin/AdminOrders',
      },
      {
        source: '/admin/users',
        destination: '/admin/AdminUsers',
      },
      {
        source: '/admin/settings',
        destination: '/admin/AdminSettings',
      },
      // NOTE: A route for '/admin/logs' is not included as the page component does not exist in your project.
    ];
  },
};

export default nextConfig;
