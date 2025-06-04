import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

export default function ImgViewer({ url, name }: { url: string; name: string }) {
  return (
    <Dialog>
      <DialogTrigger><img src={url} alt={name} className="w-32 h-32 object-cover mb-2 rounded"></img></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Image Preview</DialogTitle>
        </DialogHeader>
            <img src={url} alt={name} className="object-cover mb-2 rounded"></img>
      </DialogContent>
    </Dialog>
  );
}
