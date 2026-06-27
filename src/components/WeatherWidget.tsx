import { getWeather } from '@/lib/content';

export default function WeatherWidget() {
  const data = getWeather();
  if (!data?.temp) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-300">
      <span className="text-base leading-none">{data.emoji}</span>
      <span className="font-medium text-white">{data.temp}°F</span>
      <span className="text-gray-500 hidden sm:inline">{data.city}</span>
    </div>
  );
}
