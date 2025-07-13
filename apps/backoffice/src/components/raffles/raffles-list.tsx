import type { Raffle } from "@repo/db";

export default function RafflesList({ raffles }: { raffles: Raffle[] }) {
    return <div>{JSON.stringify(raffles)}</div>;
}