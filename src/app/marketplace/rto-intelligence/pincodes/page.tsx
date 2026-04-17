import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Image from "next/image";
import React from "react";

const RtoPincodePage = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <p className="text-sm sm:text-base text-gray-500">RTO Intelligence /</p>

      <h1 className="text-xl sm:text-2xl font-bold mt-2">
        High RTO Pincode List
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 mt-4">
        {/* LEFT CONTENT */}
        <div className="w-full">
          <p className="text-sm sm:text-base py-4 sm:py-6">
            Based on lakhs of historical orders, our algorithms have identified
            that certain pincodes are prone to very high RTO%. It is best to
            avoid targeting customers from these areas as it might lead to a
            waste of customer acquisition costs.
          </p>

          <a
            href="/files/high-rto-pincode-list.xlsx"
            download="high-rto-pincode-list.xlsx"
          >
            <Button className="rounded-none bg-black w-full sm:w-auto">
              <Download className="mr-2" />
              High RTO Pincode List
            </Button>
          </a>

          <p className="text-xs italic py-2">(Last updated on 04 Feb 2026)</p>

          <p className="text-sm sm:text-base py-4">
            These pincodes can be used as negative locations in Facebook's Ad
            Manager
          </p>

          <ol className="list-decimal pl-5 space-y-4 text-sm sm:text-base">
            <li>Download the list of pincodes from the above link.</li>

            <li>
              Collate the pincodes in a comma-separated form
              <ol className="list-[lower-alpha] pl-5 mt-2 space-y-2">
                <li>
                  Use <span className="font-medium">TEXTJOIN</span> in Excel.
                </li>
                <li>
                  Or use <span className="underline">delim.co</span>
                </li>
                <li className="break-words italic">
                  784514,784148,784529,784145
                </li>
              </ol>
            </li>

            <li>
              Open Facebook Ad Manager and create ads
              <ol className="list-[lower-alpha] pl-5 mt-2 space-y-2">
                <li>
                  Use{" "}
                  <span className="font-medium">
                    Exclude → Add locations in bulk
                  </span>
                </li>
              </ol>
            </li>

            <li>Facebook will avoid showing ads to these pincodes.</li>
          </ol>

          {/* IMAGE */}
          <div className="w-full py-6">
            <Image
              src="/images/pin-code-map.webp"
              alt="Pin code map"
              width={800}
              height={600}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-full lg:w-[40%] flex justify-center items-start">
          <Image
            src="/svg/delivery-point.svg"
            alt="Delivery Point"
            width={600}
            height={400}
            className="w-full max-w-sm lg:max-w-full h-auto"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default RtoPincodePage;
