interface StoreAboutPageProps {
  storeData: any;
}

export const StoreAboutPage = ({ storeData }: StoreAboutPageProps) => {
  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">About {storeData.store_name}</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            Welcome to {storeData.store_name}, your premier destination for bespoke window treatments and interior décor solutions.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
          <p className="text-muted-foreground mb-6">
            With years of experience in the window treatment industry, we've helped countless homeowners and businesses
            transform their spaces with custom-made curtains, blinds, shutters, and more. Every product we create is
            tailored to your exact specifications, ensuring perfect fit and finish.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">What We Offer</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
            <li>Custom-made curtains and drapes</li>
            <li>Bespoke window blinds (roller, venetian, roman, and more)</li>
            <li>Plantation shutters</li>
            <li>Curtain rods, tracks, and accessories</li>
            <li>Professional measurement and installation services</li>
            <li>Expert design consultation</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Us</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
            <li><strong>Instant Pricing:</strong> Our built-in calculator gives you accurate quotes instantly</li>
            <li><strong>Quality Materials:</strong> We use only premium fabrics and components</li>
            <li><strong>Expert Craftsmanship:</strong> Every piece is meticulously crafted by skilled artisans</li>
            <li><strong>Professional Service:</strong> From consultation to installation, we're with you every step</li>
            <li><strong>Fast Turnaround:</strong> We understand your timeline and work efficiently to meet it</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Process</h2>
          <ol className="list-decimal pl-6 text-muted-foreground space-y-3 mb-6">
            <li><strong>Browse & Configure:</strong> Use our online calculator to get instant quotes</li>
            <li><strong>Consultation:</strong> Book a free consultation to discuss your needs</li>
            <li><strong>Measurement:</strong> We take precise measurements of your windows</li>
            <li><strong>Production:</strong> Your custom treatments are expertly crafted</li>
            <li><strong>Installation:</strong> Professional installation ensures perfect results</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
