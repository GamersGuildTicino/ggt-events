import { Box, Button, HStack, Heading, VStack } from "@chakra-ui/react";
import { ExternalLink } from "lucide-react";
import type { Event } from "~/domain/events";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Event Map Section
//------------------------------------------------------------------------------

type EventMapSectionProps = {
  event: Pick<Event, "locationAddress" | "locationName">;
};

export default function EventMapSection({ event }: EventMapSectionProps) {
  const { t } = useI18n();
  const locationQuery = [event.locationName, event.locationAddress]
    .filter(Boolean)
    .join(", ");
  const embedUrl =
    "https://maps.google.com/maps" +
    `?q=${encodeURIComponent(locationQuery)}` +
    "&t=&z=15&ie=UTF8&iwloc=&output=embed";
  const googleMapsUrl =
    "https://www.google.com/maps/search/?api=1" +
    `&query=${encodeURIComponent(locationQuery)}`;

  return (
    <VStack align="stretch" gap={4} id="map">
      <HStack align="center" justify="space-between" wrap="wrap">
        <Heading size="2xl">{t("page.event.map.heading")}</Heading>

        <Button asChild borderColor="black" size="xs" variant="outline">
          <a href={googleMapsUrl} rel="noreferrer" target="_blank">
            <ExternalLink />
            {t("page.event.map.open_in_google_maps")}
          </a>
        </Button>
      </HStack>

      <Box
        borderColor="ggt.surface.border"
        borderWidth="1px"
        h={{ base: "20rem", md: "24rem" }}
        overflow="hidden"
      >
        <iframe
          height="100%"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          style={{ border: 0, height: "100%", width: "100%" }}
          title={t("page.event.map.heading")}
          width="100%"
        />
      </Box>
    </VStack>
  );
}
