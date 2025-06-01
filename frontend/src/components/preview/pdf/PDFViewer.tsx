import { Icon } from "@iconify-icon/react/dist/iconify.mjs";

export default function PDFViewer ({ url }: { url: string }) {
    return (
        <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center p-6 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <Icon icon="hugeicons:pdf-02" width="48" height="48" />
      </a>
    )
  };