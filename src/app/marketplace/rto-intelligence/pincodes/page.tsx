import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Image from "next/image";
import React from "react";

const RtoPincodePage = () => {
  return (
    <>
      <div className="mx-6">
        <p className="text-base text-gray-500">RTO Intelligence /</p>
        <h1 className="text-2xl font-bold mt-2">High RTO Pincode List</h1>
        <div className="flex flex-row gap-8">
          <div className="w-full">
            <p className="text-base py-6">
              Based on lakhs of historical orders, our algorithms have
              identified that certain pincodes are prone to very high RTO%. It
              is best to avoid targeting customers from these areas as it might
              lead to a waste of customer acquisition costs.
            </p>
            <div>
              <Button className="rounded-none bg-black" size={"lg"}>
                <Download />
                High RTO Pincode List
              </Button>
              <p className="text-xs italic pl-4 py-2">
                (Last updated on 04 Feb 2026)
              </p>
              <div>
                <p className="text-base py-4">
                  These pincodes can be used as negative locations in Facebook's
                  Ad Manager
                </p>

                <ol className="list-decimal pl-6 space-y-4">
                  <li>Download the list of pincodes from the above link.</li>

                  <li>
                    Collate the pincodes in a comma-separated form
                    <ol className="list-[lower-alpha] pl-6 mt-2 space-y-2">
                      <li>
                        You can do this in Excel itself using{" "}
                        <span className="font-medium">“TEXTJOIN”</span>{" "}
                        function.
                      </li>
                      <li>
                        Or you can use free sites such as{" "}
                        <span className="underline">delim.co</span> and paste
                        the pincodes from the downloaded file.
                      </li>
                      <li>
                        Your output should look like this –{" "}
                        <span className="italic">
                          784514,784148,784529,784145
                        </span>
                      </li>
                    </ol>
                  </li>

                  <li>
                    Open your Facebook Ad Manager and create your ads as you
                    normally would
                    <ol className="list-[lower-alpha] pl-6 mt-2 space-y-2">
                      <li>
                        In the location section, choose{" "}
                        <span className="font-medium">"Exclude"</span> and click
                        on{" "}
                        <span className="font-medium">
                          "Add locations in bulk"
                        </span>
                        . Choose the postal code option and paste the pincodes
                        in a comma-separated form.
                      </li>
                    </ol>
                  </li>

                  <li>
                    That’s it. Facebook will now avoid showing ads to users in
                    these pincodes.
                  </li>
                </ol>
              </div>
              <div className="w-[80%] py-6">
                <Image
                  src="/images/pin-code-map.webp"
                  alt="Pin code map"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
          <div className="w-full px-8">
            <Image
              src="/svg/delivery-point.svg"
              alt="Delivery Point"
              width={600}
              height={400}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RtoPincodePage;
