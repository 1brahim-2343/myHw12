import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchWeatherInfo } from "../src/api/weather";
import { CurrentWeatherType } from "../src/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const QUICK_CITIES = ["Baku", "London", "Tokyo", "New York"];
const LAST_CITY_WEATHER_SEARCH_KEY = "LAST_WEATHER_CITY_KEY";
const LAST_CITY_SEARCH_KEY = "LAST_CITY_KEY";

export default function Home() {
  const [cityInput, setCityInput] = useState("");
  const [searchedCity, setSearchedCity] = useState("");
  const [weather, setWeather] = useState<CurrentWeatherType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWeatherSearch = async (cityName?: string) => {
    const query = (cityName ?? cityInput).trim();

    if (!query) {
      setError("Please enter a city name.");
      return;
    }

    Keyboard.dismiss();
    setCityInput(query);
    setLoading(true);
    setError(null);

    try {
      const result = await fetchWeatherInfo(query);
      if (!result) {
        setWeather(null);
        setError(`Could not find weather for "${query}".`);
      } else {
        setWeather(result);
        setSearchedCity(query);
        AsyncStorage.setItem(LAST_CITY_SEARCH_KEY, query);
        AsyncStorage.setItem(
          LAST_CITY_WEATHER_SEARCH_KEY,
          JSON.stringify(result),
        );
      }
    } catch {
      setWeather(null);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const lastSearch = await AsyncStorage.getItem(
        LAST_CITY_WEATHER_SEARCH_KEY,
      );
      const lastSearchCity = await AsyncStorage.getItem(LAST_CITY_SEARCH_KEY);
      if (!lastSearch || !lastSearchCity) return;
      let resultWeather: CurrentWeatherType = JSON.parse(lastSearch);
      let resultCity: string = lastSearchCity ?? "";
      setWeather(resultWeather);
      setSearchedCity(resultCity);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Weather</Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="search"
              size={18}
              color="#64748B"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter city name..."
              placeholderTextColor="#94A3B8"
              value={cityInput}
              onChangeText={(text) => {
                setCityInput(text);
              }}
              onSubmitEditing={() => handleWeatherSearch()}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="words"
            />
            {cityInput.length > 0 && (
              <Pressable
                onPress={() => {
                  setCityInput("");
                  setError(null);
                }}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.searchButton,
              (pressed || loading) && styles.searchButtonPressed,
            ]}
            onPress={() => handleWeatherSearch()}
            disabled={loading}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </Pressable>
        </View>

        <View style={styles.chipsRow}>
          {QUICK_CITIES.map((city) => (
            <Pressable
              key={city}
              style={({ pressed }) => [
                styles.chip,
                pressed && styles.chipPressed,
              ]}
              onPress={() => handleWeatherSearch(city)}
              disabled={loading}
            >
              <Text style={styles.chipText}>{city}</Text>
            </Pressable>
          ))}
        </View>

        {loading && (
          <View style={styles.statusCard}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.statusText}>Fetching weather...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={28} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}



        {!loading && !error && weather && (
          <View style={styles.weatherCard}>
            <View style={styles.cardTopRow}>
              <View>
                <Text style={styles.cityLabel}>{searchedCity}</Text>
                <Text style={styles.codeBadge}>
                  Condition code: {weather.weathercode}
                </Text>
              </View>
              {weather.weatherIcon ? (
                <Image
                  source={{ uri: weather.weatherIcon }}
                  style={styles.weatherIcon}
                />
              ) : (
                <Ionicons name="partly-sunny" size={48} color="#F59E0B" />
              )}
            </View>

            <Text style={styles.temperature}>{weather.temperatureC}°C</Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Ionicons
                  name="thermometer-outline"
                  size={22}
                  color="#2563EB"
                />
                <Text style={styles.metricLabel}>Feels Like</Text>
                <Text style={styles.metricValue}>{weather.feelsLikeC}°C</Text>
              </View>

              <View style={styles.metricBox}>
                <Ionicons
                  name="speedometer-outline"
                  size={22}
                  color="#2563EB"
                />
                <Text style={styles.metricLabel}>Wind Speed</Text>
                <Text style={styles.metricValue}>
                  {weather.windspeedKMH} km/h
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  header: {
    marginTop: 8,
    gap: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
  },
  searchButton: {
    backgroundColor: "#534d0a",
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonPressed: {
    opacity: 0.75,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipPressed: {
    backgroundColor: "#E2E8F0",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  errorCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    fontSize: 14,
    color: "#B91C1C",
    textAlign: "center",
    fontWeight: "500",
  },
  weatherCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    gap: 20,
    marginTop: 8,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cityLabel: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  codeBadge: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  weatherIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  temperature: {
    fontSize: 60,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -2,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  metricLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
});
