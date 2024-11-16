import { validEngines, validSegments } from "./utils";

export interface ICar {
    id: string;
    title: string;
    description: string;
    company: string;
    engine: typeof validEngines[number];
    segment: typeof validSegments[number];
    dealer: string;
    images: string[];
    createdAt: string;
    updatedAt: string;
    userId: string;
    User: {
        username: string
    }
}

// type for the api result
export interface ICarResult {
    cars: ICar[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
}