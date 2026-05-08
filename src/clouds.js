const BASE = import.meta.env.VITE_POINTCLOUD_BASE_URL || "/pointclouds/";

export const CLOUDS = [
  {
    id: "obra",
    name: "Obra Juana Manso",
    path: "obra",
    description: "Construcción Puerto Madero, vuelo 2026-02-27",
    points: "5.4 M",
    pointBudget: 2_000_000,
  },
  {
    id: "pm-modelo",
    name: "Puerto Madero",
    path: "pm-modelo",
    description: "Modelo Puerto Madero, ~246m × 246m",
    points: "7.8 M",
    pointBudget: 2_500_000,
  },
];

export const cloudBaseUrl = (c) => `${BASE}${c.path}/`;
export const cloudById = (id) => CLOUDS.find((c) => c.id === id) || CLOUDS[0];
