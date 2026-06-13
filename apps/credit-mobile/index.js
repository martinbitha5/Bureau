// Point d'entrée : charge le polyfill AVANT expo-router (donc avant tout fetch/AbortController).
import "./polyfills";
import "expo-router/entry";
