  console.log('Config file loaded successfully');
const config = {
    backendURL: 'http://172.22.80.1:696',
    routes: {
      '/api/login': '/user/login',
      '/api/signin': '/user/create',
      '/api/products/load': '/product/retrive',
      '/api/cart/add': '/cart/add',
      '/api/cart/view':'/cart/view',
      '/api/cart/remove':'/cart/remove',
      '/api/cart/checkout':'/product/buy',
      '/api/user/view':'/user/view',
      '/api/user/update':'/user/update',

      '/api/admin/users/view': '/admin/user/view',
      '/api/admin/users/delete': '/admin/user/delete',
      '/api/admin/users/update-role': '/admin/user/update',
      '/api/admin/products/add': '/product/add',
      '/api/admin/products/delete': '/product/remove',
      '/api/stats':'/statics/retrive',
      '/api/user/payment-methods/check':'/payment/checker',
      "/api/post-tweet": "/api/post-tweet"

    }
  };

  export default config;
  console.log('End of config file');