import { useEffect, useState, MutableRefObject } from "react";

const options: IntersectionObserverInit = {
    root: null, // viewport - default
    rootMargin: '0px', // no margin - default
    threshold: 0.1, // 80% of target visible
};

// custom hook to track the position of any element on UI
export const useIntersectionObserver = (targetRef: MutableRefObject<HTMLElement | null>): boolean => {
    const [isIntersecting, setIsIntersecting] = useState<boolean>(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        const currentTarget = targetRef.current;

        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [targetRef]);

    return isIntersecting;
};