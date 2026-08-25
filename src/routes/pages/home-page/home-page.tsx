import { Box, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import usePageTitle from "~/hooks/use-page-title";
import useI18n from "~/i18n/use-i18n";
import HomeActionsSection from "./home-actions-section";
import HomeEventsInfoPanel from "./home-events-info-panel";
import HomeHero from "./home-hero";
import HomeUpcomingEventsSection from "./home-upcoming-events-section";
import useHomeEvents from "./use-home-events";

//------------------------------------------------------------------------------
// Home Page
//------------------------------------------------------------------------------

export default function HomePage() {
  const { t } = useI18n();
  const { eventsState, upcomingEvents } = useHomeEvents();

  usePageTitle(t("page.home.heading"));

  return (
    <VStack
      align="center"
      gap={0}
      mb={{ base: "-1rem", md: "-2rem" }}
      mt={{ base: "-1rem", md: "-2rem" }}
      w="full"
    >
      <HomeBand backgroundColor="transparent" fullWidthContent p={0}>
        <HomeHero />
      </HomeBand>

      <HomeBand backgroundColor="white">
        <HomeUpcomingEventsSection
          eventsState={eventsState}
          upcomingEvents={upcomingEvents}
        />
      </HomeBand>

      <HomeBand backgroundColor="ggt.page.bg">
        <HomeActionsSection />
      </HomeBand>

      <HomeBand backgroundColor="white">
        <HomeEventsInfoPanel />
      </HomeBand>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Home Band
//------------------------------------------------------------------------------

type HomeBandProps = {
  backgroundColor: string;
  children: ReactNode;
  fullWidthContent?: boolean;
  p?: number;
};

function HomeBand({
  backgroundColor,
  children,
  fullWidthContent = false,
  p,
}: HomeBandProps) {
  return (
    <Box
      bg={backgroundColor}
      marginInline="calc(50% - 50vw)"
      px={p ?? { base: 4, md: 8 }}
      py={p ?? { base: 8, md: 12 }}
      w="100vw"
    >
      <Box maxW={fullWidthContent ? undefined : "72em"} mx="auto" w="full">
        {children}
      </Box>
    </Box>
  );
}
