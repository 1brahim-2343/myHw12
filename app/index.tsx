import React from "react";
import { Alert, Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchWeatherInfo } from "../src/api/weather";

const handleWeatherSearch = async () => {
  try {
    let result = await fetchWeatherInfo("baku");
  } catch {}
};

export default function Home() {
  return (
    <SafeAreaView>
      <Button title="Click me" onPress={handleWeatherSearch}></Button>
    </SafeAreaView>
  );
}
