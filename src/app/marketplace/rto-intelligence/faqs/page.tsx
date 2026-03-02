import { FaqSection } from "@/components/ui/faqs-accordion";
import React from "react";

const faqs = [
  {
    question: "What is RTO?",
    answer:
      "RTO stands for Return to origin. It refers to orders which have been shipped by the supplier, but were not delivered to the customer due to various reasons such as incorrect address, customer’s refusal of order, customer unavailability etc.",
  },
  {
    question: "Why is RTO is bad fir my business as well as Roposo Clout?",
    answer:
      "RTO orders represent missed revenue for you as well as Roposo clout. We also incur significant reverse logistics costs to send the product back to the supplier. To recover these reverse logistics costs, we charge you a fee for every RTO order.",
  },
  {
    question: "How are RTO charges calculated?",
    answer:
      "RTO charges are applicable on all RTO orders. The charges vary as per product weight. You can check the applicable RTO charges for any product from its product page before pushing it to Shopify. All charges mentioned there are inclusive of GST.",
  },
  {
    question: "What does RTO risk mean?",
    answer:
      "RTO Risk is our system’s prediction of how likely an order is likely to be RTOed. We classify orders as High, Moderate and No Risk.",
  },
  {
    question: "How is RTO risk calculated?",
    answer:
      "Based on millions of historical and recent orders, our algorithm factors in various order parameters such as pincode, customer address, price, category, etc. and predicts the probability of RTO happening and assigns a risk score.",
  },
  {
    question: "When is RTO risk calculated, and where is it displayed?",
    answer:
      "RTO risk is calculated as soon as the order is synced to clout from your website (expect a few minutes processing time) and is displayed on your clout dashboard. As of now, RTO risk is only calculated for cash on delivery orders.",
  },
  {
    question: "One of my order is flagged as High/Moderate risk. What do I do?",
    answer:
      "Below the risk score of each order, the reason for the risk is also displayed. Depending on this reason, you may take appropriate action steps to reduce the risk.",
  },
  {
    question:
      "My order is flagged as High/Moderate Risk because of Short Address Length or Invalid Address. What does this mean and what do I do?",
    answer:
      "For delivery to be successful. the customer address needs to be complete. By invalid address, our system detects that the address does not have functional words, but gibberish (say xnururnjnjsew) . By short address length, we suspect that the address is not long enough to be complete. You are advised to contact your customer and get the address updated, by clicking on the view / Edit Details button in the customer details column for the order on your clout dashboard. As soon as you update the address, the system re calculates the RTO risk and assigns a new Risk category.",
  },
];
const RtoFaqsPage = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <p className="text-gray-500">RTO Intelligence /</p>
      <h2 className="text-2xl font-bold mb-8">FAQs</h2>

      <FaqSection items={faqs} />
    </div>
  );
};

export default RtoFaqsPage;
