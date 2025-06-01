import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import FilePreview from "../preview/FilePreview";

interface FileUploadProps {
    label: string;
    files: File[];
    onUploadFile: (files: File[]) => void;
    className?: string;
    fileRefs: string[];
}

export default function FileUpload(props: FileUploadProps) {

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    props.onUploadFile([...selectedFiles.map((file) => file as File)]);
  };

  console.log("files refs", props.fileRefs);

  return (
    <div className={`${props.className ? props.className : "w-[100%]"} flex flex-col gap-2`}>
    <Label>{props.label}</Label>
    {/* File preview section */}
      <div className="w-[100%]">
        <div className="mt-4">
          <div className={`flex justify-start items-center gap-2 p-2 bg-gray-100 rounded-lg max-w-[100] overflow-x-scroll scroll-px-6 transition-all duration-300`}>
              <div className="flex gap-2">
                {props.files && props.files.map((file, index) => <FilePreview key={`file-upload-preview-${index}`} file={file}/>)}
                {props.fileRefs && props.fileRefs.map((fileRef, index) => <FilePreview key={`file-upload2-preview-${index}`} fileRef={fileRef}/>)}
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
