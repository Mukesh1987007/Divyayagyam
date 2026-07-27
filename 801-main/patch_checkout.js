const fs = require('fs');
let content = fs.readFileSync('app/checkout/page.tsx', 'utf8');

// Use regex to catch any variation of the broken line
content = content.replace(
  /toast\.success\(Coupon applied! You saved [^)]*\)/,
  'toast.success(`Coupon applied! You saved ₹${data.coupon.discountAmount}`)'
);

fs.writeFileSync('app/checkout/page.tsx', content, 'utf8');
console.log('Fixed checkout page');
