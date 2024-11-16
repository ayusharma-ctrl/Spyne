import * as React from "react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel"
import Image from "next/image"

const ImageCarousel = ({ images }: { images: string[] }) => {
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)
    const [count, setCount] = React.useState(0)

    React.useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])


    return (
        <div className="mx-auto max-w-[80%]">
            <Carousel setApi={setApi}>
                <CarouselContent>
                    {images?.map((item, index) => (
                        <CarouselItem key={index}>
                            <Image loading='lazy' src={item} alt={"car-image"} width={400} height={300} className='mx-auto rounded-lg w-full cursor-grab' />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
            <div className="py-2 text-center text-sm text-muted-foreground">
                Image {current} of {count} (Scrollable)
            </div>
        </div>
    )
}

export default ImageCarousel