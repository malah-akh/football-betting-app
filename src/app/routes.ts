import { createBrowserRouter } from "react-router";
import { HomeScreen } from "@/app/screens/HomeScreen";
import { PicksListScreen } from "@/app/screens/PicksListScreen";
import { MatchDetailScreen } from "@/app/screens/MatchDetailScreen";
import { MultipleDetailsScreen } from "@/app/screens/MultipleDetailsScreen";
import { CombinedListScreen } from "@/app/screens/CombinedListScreen";
import { CombinedDetailsScreen } from "@/app/screens/CombinedDetailsScreen";
import { FavoritesScreen } from "@/app/screens/FavoritesScreen";
import { ResultsScreen } from "@/app/screens/ResultsScreen";
import { ProfileScreen } from "@/app/screens/ProfileScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeScreen,
  },
  {
    path: "/picks",
    Component: PicksListScreen,
  },
  {
    path: "/match/:id",
    Component: MatchDetailScreen,
  },
  {
    path: "/multiples",
    Component: MultipleDetailsScreen,
  },
  {
    path: "/combined",
    Component: CombinedListScreen,
  },
  {
    path: "/combined-details",
    Component: CombinedDetailsScreen,
  },
  {
    path: "/favorites",
    Component: FavoritesScreen,
  },
  {
    path: "/results",
    Component: ResultsScreen,
  },
  {
    path: "/profile",
    Component: ProfileScreen,
  },
]);