import { fetch } from "expo/fetch";
import { CurrentWeatherType } from "../types";

const WEATHER_BASE_URL = "https://wttr.in/";
const WEATHER_URL_QUERY_PARAM = "format=j2";

export async function fetchWeatherInfo(
  cityName: string,
): Promise<CurrentWeatherType | undefined> {
  try {
    const url = `${WEATHER_BASE_URL}/${cityName}?${WEATHER_URL_QUERY_PARAM}`;

    const response = await fetch(url);
    if (!response.ok) return undefined;

    const data = await response.json();
    let current_condition = data.current_condition[0];
    if (!current_condition) return undefined;

    return {
      temperatureC: current_condition.temp_C,
      windspeedKMH: current_condition.windspeedKmph,
      feelsLikeC: current_condition.FeelsLikeC,
      weathercode: current_condition.weatherCode,
      weatherIcon: current_condition.weatherIconUrl.value,
    };
  } catch {
    return undefined;
  }
}
