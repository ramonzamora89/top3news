import { getMarket } from '@/lib/content';

export default function SP500Widget() {
  const data = getMarket();
  if (!data?.price) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-gray-500">S&amp;P</span>
      <span className="font-medium text-white">{data.price.toLocaleString()}</span>
      <span className={`font-medium ${data.up ? 'text-green-400' : 'text-red-400'}`}>
        {data.up ? '▲' : '▼'} {Math.abs(data.changePercent)}%
      </span>
    </div>
  );
}
