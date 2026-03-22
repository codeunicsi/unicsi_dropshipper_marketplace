"use client";

import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DownloadMediaDropdownProps = {
  currentMediaUrl: string;
  allMediaUrls: string[];
};

const triggerDownload = (url: string, fileName: string) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.target = "_blank";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

export default function DownloadMediaDropdown({
  currentMediaUrl,
  allMediaUrls,
}: DownloadMediaDropdownProps) {
  const onDownloadCurrent = () => {
    triggerDownload(currentMediaUrl, "current-media.jpg");
  };

  const onDownloadAll = () => {
    allMediaUrls.forEach((url, index) => {
      triggerDownload(url, `media-${index + 1}.jpg`);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-full bg-white shadow-2xl hover:bg-white cursor-pointer"
        >
          <Download />
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem
          onClick={onDownloadCurrent}
          className="flex items-center gap-3 bg-white "
        >
          <Download />
          <span className="text-xs cursor-pointer">Download Current Media</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDownloadAll}
          className="flex items-center gap-3"
        >
          <Download />
          <span className="text-xs cursor-pointer">
            Download All Media ({allMediaUrls.length})
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
