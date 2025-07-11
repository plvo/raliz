import Contracts from "@/components/contracts";
import { QueryBoundary } from "@/components/shared/query-boundary";
import { withUser } from '@/lib/wrappers/with-user';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contracts",
};

function Page() {
    return (
        <QueryBoundary>
            <Content />
        </QueryBoundary>
    );
}

function Content() {
    return (
        <div>
            <h1>Test d'intéraction avec le contrat</h1>
            <Contracts />
        </div>
    );
}

export default withUser(Page);