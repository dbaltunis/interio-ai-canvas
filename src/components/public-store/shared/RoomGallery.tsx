import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface RoomGalleryProps {
  storeSlug: string;
}

const galleryImages = [
  {
    url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=400&fit=crop",
    room: "Living Room",
    style: "Modern Minimalist"
  },
  {
    url: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=600&h=400&fit=crop",
    room: "Bedroom",
    style: "Classic Elegance"
  },
  {
    url: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=600&h=400&fit=crop",
    room: "Dining Room",
    style: "Contemporary"
  },
  {
    url: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=600&h=400&fit=crop",
    room: "Office",
    style: "Professional"
  },
  {
    url: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&h=400&fit=crop",
    room: "Kitchen",
    style: "Bold & Bright"
  },
  {
    url: "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=600&h=400&fit=crop",
    room: "Bathroom",
    style: "Waterproof"
  },
];

export const RoomGallery = ({ storeSlug }: RoomGalleryProps) => {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Room Inspiration</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover stunning window treatment ideas for every room in your home
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <Link
              key={index}
              to={`/store/${storeSlug}/products`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg"
            >
              <img
                src={image.url}
                alt={`${image.room} - ${image.style}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-1">{image.room}</h3>
                <p className="text-sm text-white/90 mb-3">{image.style}</p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Get This Look
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
