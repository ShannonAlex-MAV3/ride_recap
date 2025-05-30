import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface FileUploadProps {
    label: string;
    files: File[];
    onUploadFile: (files: File[]) => void;
    className?: string;
}

export default function FileUpload(props: FileUploadProps) {

  const onUpload = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    props.onUploadFile([...selectedFiles.map((file) => file as File)]);
  };

  return (
    <div className={`${props.className ? props.className : "w-[100%]"} flex flex-col gap-2`}>
    <Label>{props.label}</Label>
    {/* File previewe section */}
      <div className="w-[100%]">
        <div className="mt-4">
          <div className={`${props.files.length == 0 ? "hidden" : ""} flex justify-start items-center gap-2 p-2 bg-gray-100 rounded-lg max-w-[100] overflow-x-scroll scroll-px-6 transition-all duration-300`}>
              <div className="flex gap-2">
                {props.files && props.files.map((file, index) => {
                  if (file.type.includes("pdf")) {
                    return (
                      <a
                        key={index}
                        href={URL.createObjectURL(file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-6 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <Icon icon="hugeicons:pdf-02" width="48" height="48" />
                      </a>
                    );
                  }
                  return (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-32 h-32 object-cover mb-2 rounded"
                    ></img>
                  );
                })}
              </div>
            </div>
        </div>
      </div>
      {/* File Upload section */}
      <div className="w-[100%] items-center gap-1.5">
        <div
          onClick={() => document.getElementById("file")?.click()}
          className="flex items-center justify-center w-[100%] h-12 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <Label htmlFor="file" className="flex items-center gap-2">
            <Icon icon="tabler:upload" width="24" height="24" />
            Upload File
          </Label>
          <Input id="file" type="file" hidden={true} className="hidden" multiple={true} onChange={onUpload} />
        </div>
      </div>
    </div>
  );
}
