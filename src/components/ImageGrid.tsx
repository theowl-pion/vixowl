import { Image as ImageType } from "@/types/image";
import ImageCard from "./ImageCard";

interface ImageGridProps {
  images: ImageType[];
  onEdit: (id: string, src: string) => void;
  onDelete: (img: { id: string; src: string }) => void;
  onDownload: (src: string) => void;
}

export default function ImageGrid({
  images,
  onEdit,
  onDelete,
  onDownload,
}: ImageGridProps) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {images.map((img) => (
          <ImageCard
            key={img.id}
            id={img.id}
            src={img.src}
            onEdit={onEdit}
            onDelete={onDelete}
            onDownload={onDownload}
          />
        ))}
      </div>
    </div>
  );
}
