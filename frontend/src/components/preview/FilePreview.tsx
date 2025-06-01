import ImgViewer from "./img/ImgViewer";
import PDFViewer from "./pdf/PDFViewer";

export default function FilePreview({ file, fileRef }: { file?: File; fileRef?: string }) {

  console.log("fileRef", fileRef);
  console.log("file", file);
  const getFileType = () => {
    if (file) return file.type;
    if (fileRef) return fileRef.split(".").pop();
  };
  const createURL = () => {
    if (file) return URL.createObjectURL(file);
    if (fileRef) return fileRef;
  };

  if (getFileType()!.includes("pdf")) {
    return <PDFViewer url={createURL()!} />;
  }
  return <ImgViewer url={createURL()!} name={(file ? file.name : fileRef)!} />;
}
