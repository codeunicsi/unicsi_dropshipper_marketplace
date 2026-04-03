export interface FaqQuestion {
  slug: string;
  question: string;
  answer: string;
}

export interface FaqSubTopic {
  slug: string;
  title: string;
  faqs: FaqQuestion[];
}

export interface FaqTopic {
  slug: string;
  title: string;
  description?: string;
  subTopics: FaqSubTopic[];
}

export const faqTopics: FaqTopic[] = [
  {
    slug: "roposo-clout-setup",
    title: "Roposo Clout Setup",
    subTopics: [
      {
        slug: "how-roposo-clout-works",
        title: "How Roposo Clout Works",
        faqs: [
          {
            slug: "how-roposo-clout-works",
            question: "How Roposo Clout Works",
            answer:
              "Roposo Clout simplifies the dropshipping process. First, you can shortlist products from a wide selection. Then, select the products you want to sell, add your desired profit margin, and seamlessly push those products to your Shopify store. You can also track orders effortlessly for a smooth operational experience",
          },
          {
            slug: "bank-details-and-profile-setup",
            question:
              "How do I set up my bank details and complete my profile on Roposo Clout?",
            answer: `To set up your bank details and complete your profile on Roposo Clout:
Log in to your account.
Go to the right side and select Clout Profile.
Click on Bank Details and enter your bank account number, account holder's name, and IFSC code.
Complete any additional profile fields (like personal details) and fill in your GST details.
Click Save to update your information.`,
          },
          {
            slug: "integrate-roposo-clout-with-shopify",
            question: "How do I integrate Roposo Clout with Shopify?",
            answer:
              "Integrating Roposo Clout with Shopify is quick and easy. Simply install the app from the Shopify App Store, follow the setup instructions, and you’ll be ready to start adding products and managing your store within minutes.",
          },
          {
            slug: "order-delivery-process",
            question:
              "How does the order delivery process work on Roposo Clout?",
            answer: `The order delivery process on Roposo Clout works as follows:
1.Order Placement: A customer places an order on your Shopify store. 2.Processing: Roposo Clout confirms the order with the supplier. 3.Shipping: The supplier prepares the product for shipment and hands it to the logistics partner. 4.Tracking: You can track the order status through the Roposo Clout dashboard. 5.Delivery: The order is delivered to the customer’s address.
This streamlined process ensures quick and accurate order fulfillment.`,
          },
          {
            slug: "receive-payments-on-roposo-clout",
            question: "How do I receive my payments on Roposo Clout?",
            answer:
              "Payments are made on a weekly basis, and you will receive your payment every Friday. Once the product is delivered and the 5-day return period is over, your payment will be processed and released. Ensure your bank details are correctly set up to avoid any delays.",
          },
          {
            slug: "shipment-and-rto-charges",
            question:
              "What are the shipment and RTO (Return to Origin) charges?",
            answer:
              "Shipping costs are included in the total price, and return charges will apply",
          },
        ],
      },
      {
        slug: "shipping",
        title: "Shipping",
        faqs: [
          {
            slug: "shipping-faq-1",
            question:
              "How do I manage orders and shipping for my dropshipping store?",
            answer: `After receiving an order, the supplier ships the product directly to the customer. You can keep track of orders through your Roposo Clout dashboard, where you can monitor order status and manage customer inquiries.
`,
          },
        ],
      },
    ],
  },
  {
    slug: "shopify-store-management",
    title: "Shopify Store Management",
    subTopics: [
      {
        slug: "online-store-setup",
        title: "Online store set up",
        faqs: [
          {
            slug: "online-store-setup-faq-1",
            question: "How do I create a Shopify store?",
            answer: `Follow these quick steps to set up your Shopify store. For detailed guidance, check our video:
1.Sign up and choose a store name. 2.Pick and customize a theme. 3.Add products with images and details—use the Roposo Clout app to easily source and upload products. 4.Set up payment and shipping options. 5.Launch your store by removing the password page. Watch the video for more help!`,
          },
          {
            slug: "online-store-setup-faq-1",
            question: `Which Shopify subscription should I opt for?`,
            answer: `Start with the Basic Shopify plan if you’re new, and upgrade as your business grows and requires more features.`,
          },
        ],
      },
      {
        slug: "theme",
        title: "Theme",
        faqs: [
          {
            slug: "theme-faq-1",
            question:
              "How to Choose the Right Theme for Your Shopify Store? 🛒",
            answer: `1️⃣ Identify Your Brand Style: Consider your brand’s personality and what will resonate with your audience.
2️⃣ Explore Theme Features: Look for themes that offer essential features like customizable layouts, product display options, and responsive designs.
3️⃣ Consider User Experience: Choose a theme that enhances navigation and keeps your customers engaged.
4️⃣ Check Compatibility: Ensure the theme works well with apps you plan to use, like payment gateways and marketing tools.
5️⃣ Review and Preview: Always preview themes on multiple devices to see how they look and function.
Popular Free Themes to Consider:
Debut - Ideal for showcasing products beautifully. Brooklyn - Great for modern apparel stores with a unique look. Narrative - Perfect for storytelling and branding with a clean layout. Dawn - A flexible and fast-loading theme, perfect for any type of merchandise. Choose wisely to create an amazing shopping experience! ✨`,
          },
        ],
      },
      {
        slug: "domain",
        title: "Domain",
        faqs: [
          {
            slug: "domain-faq-1",
            question: `Do I need a custom domain?`,
            answer: `1️⃣ Professional Image: A custom domain gives your business a more professional appearance and establishes credibility with customers.
2️⃣ Memorable & Trustworthy: It helps your business stand out and makes it easier for customers to remember, boosting their confidence in your brand.
3️⃣ Branded Email: With a custom domain, you can create branded email addresses, which further improve the professional image of your business.
4️⃣ Platform Default Domain: While a custom domain is recommended, you can start with the default domain provided by your platform. This is ideal for testing your business or in the early stages of development.
5️⃣ SEO Benefits: A custom domain can help with search engine optimization (SEO), making it easier for customers to find your site and improving your rankings on search engines.
6️⃣ Flexibility for Growth: As your business grows, a custom domain offers flexibility for scaling your marketing, building customer trust, and expanding your brand presence.
7️⃣ Control & Ownership: A custom domain gives you full control over your online presence and ensures that your brand identity is unique and protected.`,
          },
          {
            slug: "domain-faq-1",
            question: "How do I connect a free domain to my Shopify store?",
            answer: `You can't get a completely free custom domain, but Shopify does provide a free myshopify.com domain for all users. Here's how to connect or use a domain:
1.Use the Free myshopify.com Domain: When you set up your Shopify store, you're automatically given a free domain in this format: your-store-name.myshopify.com.
2.Custom Domain: If you want a custom domain (e.g., www.yourstore.com), you'll need to purchase one through Shopify or a third-party provider. Once purchased:
Go to Settings > Domains in your Shopify admin. Choose Connect existing domain and follow the steps.`,
          },
        ],
      },
      {
        slug: "payment-gateway",
        title: "Payment Gateway",
        faqs: [
          {
            slug: "payment-gateway-faq-1",
            question:
              "What payment method should I select for my Shopify store?",
            answer:
              "Cash on Delivery (COD) is often the best method, especially if your customers prefer paying at the time of delivery. COD can increase trust, as customers only pay when they receive their order, which is particularly useful in markets where online payments are less common. However, you may also want to offer additional options like credit/debit cards or digital wallets for added convenience.",
          },
          {
            slug: "payment-gateway-faq-1",
            question:
              "How do I set up Cash on Delivery (COD) payment gateways on my Shopify store?",
            answer: `Select the Shopify App Store and search for COD payment apps. Install an app that meets your needs, then follow the app's setup instructions.
Now, customers can choose Cash on Delivery at checkout!`,
          },
        ],
      },
      {
        slug: "policies",
        title: "Policies",
        faqs: [
          {
            slug: "policies-faq-1",
            question: "What store policies should I have in place?",
            answer: `To run a successful online store, you should have the following policies in place:
1.Return Policy: Clearly outline your return process, including the time frame for returns, condition requirements, and how customers can initiate a return.
2.Shipping Policy: Detail your shipping methods, estimated delivery times, and shipping costs. Include information on tracking orders and international shipping if applicable.
3.Privacy Policy: Explain how you collect, use, and protect customer information. Include details about data sharing and customer rights regarding their personal data.
4.Terms and Conditions: Specify the rules for using your site, including customer responsibilities and any disclaimers about your products and services.
Policy Template for Dropshippers: Return Policy: We accept returns within 30 days of purchase. Items must be in their original condition with tags attached. To initiate a return, please contact us at [your email].
Shipping Policy: We offer free standard shipping on all orders. Orders are typically processed within 3-5 business days and delivered within 7-10 business days. You can track your order through the link provided in your confirmation email.
Privacy Policy: Your privacy is important to us. We collect personal information to process your orders and enhance your shopping experience. We do not sell or share your information with third parties without your consent.
`,
          },
          {
            slug: "policies-faq-1",
            question: "How can I build customer trust for my store?",
            answer: `To build customer trust:
1.Showcase Authentic Reviews: Display genuine customer reviews and ratings to establish credibility.
2.Provide Clear Policies: Be transparent with your return, refund, and shipping policies. Customers appreciate knowing what to expect.
3.Use Secure Payment Methods: Offer trusted payment gateways and display security badges to assure customers their data is safe.
4.Offer Excellent Support: Provide easy access to customer support through chat, email, or phone. Prompt, helpful responses build trust.
5.Maintain Consistency: Ensure your branding, messaging, and product quality are consistent across all touchpoints.`,
          },
        ],
      },
      {
        slug: "product-searching",
        title: "Product Searching",
        faqs: [
          {
            slug: "product-searching-faq-1",
            question: "How do I choose the right products for my store?",
            answer:
              "On the Roposo Clout dashboard, you’ll discover several categories, including Top New Trendy Products, Potential Heroes, Newly Launched Items, Hot Selling Products, and Popular Demand. Each product tile provides essential metrics, such as NTG%, total sales, the number of active ads on Meta, and the delivery rate. With this data in hand, you can effectively choose the products that align with your strategy",
          },
          {
            slug: "product-searching-faq-1",
            question:
              "How can I find winning products for Indian dropshipping?",
            answer: `Look for trending and in-demand products using platforms like Roposo Clout.Check out the "Hot Selling" and "Newly Launched" sections for ideas. You can also monitor product margins and sales history to make informed decisions.
`,
          },
        ],
      },
      {
        slug: "landing-page-pdp",
        title: "Landing Page (PDP)",
        faqs: [
          {
            slug: "landing-page-pdp-faq-1",
            question:
              "How do I create a good Product Detail Page (PDP) for my store?",
            answer: `To create an effective Product Detail Page (PDP) that boosts conversions:
1.High-Quality Images: Use clear, professional images of the product from multiple angles. Include zoom-in options and lifestyle shots if possible.
2.Compelling Product Descriptions: Write clear and concise descriptions highlighting key features, benefits, and how the product solves a problem for the customer. Avoid overly technical language unless necessary.
3.Add Reviews: Display customer reviews or testimonials to build trust and social proof.
4.Clear Pricing: Make the price easily visible and mention any discounts or offers prominently.
5.Call-to-Action: Include a clear "Buy Now" or "Add to Cart" button, and ensure it stands out visually on the page.
6.Shipping & Returns Info: Offer details on shipping times, costs, and return policies for transparency.`,
          },
        ],
      },
    ],
  },
  {
    slug: "advertising-and-marketing",
    title: "Advertising & Marketing",
    subTopics: [
      {
        slug: "facebook-business-manager-profile-setup",
        title: "Facebook Business Manager & Profile Setup",
        faqs: [
          {
            slug: "facebook-business-manager-profile-setup-faq-1",
            question: "Add Facebook Business Manager FAQ question here",
            answer: "",
          },
        ],
      },
      {
        slug: "pixel-integration",
        title: "Pixel Integration",
        faqs: [
          {
            slug: "pixel-integration-faq-1",
            question: "Add pixel integration FAQ question here",
            answer: "",
          },
        ],
      },
      {
        slug: "facebook-and-instagram-page",
        title: "Facebook And Instagram Page",
        faqs: [
          {
            slug: "facebook-and-instagram-page-faq-1",
            question: "Add Facebook and Instagram page FAQ question here",
            answer: "",
          },
        ],
      },
      {
        slug: "create-ad-campaign-facebook",
        title: "Create AD Campaign Facebook",
        faqs: [
          {
            slug: "create-ad-campaign-facebook-faq-1",
            question: "Add ad campaign FAQ question here",
            answer: "",
          },
        ],
      },
      {
        slug: "budget-and-optimization",
        title: "Budget & Optimization",
        faqs: [
          {
            slug: "budget-and-optimization-faq-1",
            question: "Add budget and optimization FAQ question here",
            answer: "",
          },
        ],
      },
    ],
  },
  {
    slug: "learn-dropshipping",
    title: "Learn Dropshipping",
    subTopics: [
      {
        slug: "how-to-start-dropshipping",
        title: "How to start dropshipping",
        faqs: [
          {
            slug: "how-to-start-dropshipping-faq-1",
            question: "Add learn dropshipping FAQ question here",
            answer: "",
          },
        ],
      },
    ],
  },
  {
    slug: "improving-delivery-rates",
    title: "Improving Delivery Rates",
    subTopics: [
      {
        slug: "rto-intelligence",
        title: "RTO Intelligence",
        faqs: [
          {
            slug: "rto-intelligence-faq-1",
            question: "Add RTO intelligence FAQ question here",
            answer: "",
          },
        ],
      },
    ],
  },
];

export function getFaqTopicBySlug(slug: string) {
  return faqTopics.find((topic) => topic.slug === slug);
}

export function getFaqSubTopicBySlug(topic: FaqTopic, subTopicSlug?: string) {
  if (!subTopicSlug) return undefined;
  return topic.subTopics.find((subTopic) => subTopic.slug === subTopicSlug);
}

export function getFaqItemCount() {
  return faqTopics.reduce((total, topic) => {
    const topicFaqCount = topic.subTopics.reduce(
      (subTotal, subTopic) => subTotal + subTopic.faqs.length,
      0,
    );
    return total + topicFaqCount;
  }, 0);
}
