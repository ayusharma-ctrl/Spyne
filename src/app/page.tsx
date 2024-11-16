import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilterIcon, CarIcon, BadgeIndianRupee, } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 xl:py-48 px-4 md:px-8">
          <div className="flex flex-col items-center space-y-4 lg:space-y-8 text-center">
            <h1 className="font-bold tracking-tighter text-3xl sm:text-4xl md:text-5xl lg:text-6xl/none">
              Discover Your Perfect Car
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl transition-colors duration-200 ease-in-out hover:text-gray-400">
              Browse through a wide selection of cars tailored to your preferences.
              Affordable prices, high-quality vehicles, and easy search options.
            </p>
            <div className="space-x-4">
              <Link href={"/car"}>
                <Button>View Listings</Button>
              </Link>
              <Link href={"/car/add"}>
                <Button variant={"outline"}>Add Your Car</Button>
              </Link>
              {/* login button */}
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-12 md:py-24 lg:py-32 px-4 md:px-8 bg-gray-100">
          <h2 className="font-bold tracking-tighter text-3xl sm:text-4xl md:text-5xl text-center mb-12">
            Why Choose Us?
          </h2>
          {/* Key Features */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* feature 1 */}
            <div className="flex flex-col items-center space-y-4 text-center hover:opacity-60">
              <CarIcon className="h-12 w-12" />
              <h3 className="text-xl font-bold">Wide Selection</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Find vehicles from various makes, models, and years.
              </p>
            </div>
            {/* feature 2 */}
            <div className="flex flex-col items-center space-y-4 text-center hover:opacity-60">
              <BadgeIndianRupee className="h-12 w-12" />
              <h3 className="text-xl font-bold">Competitive Prices</h3>
              <p className="text-gray-500 dark:text-gray-400">
                We ensure fair pricing for buyers and sellers alike.
              </p>
            </div>
            {/* feature 3 */}
            <div className="flex flex-col items-center space-y-4 text-center hover:opacity-60">
              <FilterIcon className="h-12 w-12" />
              <h3 className="text-xl font-bold">Easy to Search</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Filter cars by price, make, year, and more for faster results.
              </p>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
