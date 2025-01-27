import Image from "next/image";

interface ImageDisplayProps {
  generatedImage: string | null;
  imageError: boolean;
  onImageError: () => void;
}

export function ImageDisplay({
  generatedImage,
  imageError,
  onImageError,
}: ImageDisplayProps) {
  return (
    <div className="max-w-2xl mx-auto aspect-square bg-white/20 backdrop-blur-md rounded-xl overflow-hidden relative">
      {generatedImage && !imageError ? (
        <Image
          src={generatedImage}
          alt="Generated artwork"
          fill
          className="object-contain"
          onError={onImageError}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white/50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
            Waiting for prompt...
          </div>
        </div>
      )}
    </div>
  );
}
