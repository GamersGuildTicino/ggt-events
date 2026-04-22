import type { I18nContextValue } from "~/i18n/i18n-context";

//------------------------------------------------------------------------------
// Format Player Count
//------------------------------------------------------------------------------

export function formatPlayerCount({
  maxPlayers,
  minPlayers,
  t,
  ti,
}: {
  maxPlayers: number;
  minPlayers: number;
  t: I18nContextValue["t"];
  ti: I18nContextValue["ti"];
}) {
  if (minPlayers !== maxPlayers) {
    return ti("common.players.range", String(minPlayers), String(maxPlayers));
  }

  if (minPlayers === 1) return t("common.players.one");
  return ti("common.players.count", String(minPlayers));
}
