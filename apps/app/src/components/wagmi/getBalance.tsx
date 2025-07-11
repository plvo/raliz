import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';

export function Balance() {
  const { address } = useAccount();

  const { data, isLoading, error } = useBalance({ address });

  return (
    <div>
      <h2>Balance</h2>
      <div>
        {data?.value !== undefined && `${formatUnits(data.value, data.decimals)} ${data.symbol}`}{' '}
        {isLoading && 'Loading...'} {error && `Error: ${error.message}`}
      </div>
    </div>
  );
}
