import { getApiDocs } from "@/../lib/swagger";
import ReactSwagger from "./react-swagger";
import Container from "@/components/common/Container";

export default async function IndexPage() {
    const spec = await getApiDocs();
    return (
        <Container>
            <section className="w-full">
                <ReactSwagger spec={spec} />
            </section>
        </Container>
    );
}