import { Box, Center, Flex, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import usePageTitle from "~/hooks/use-page-title";
import useI18n from "~/i18n/use-i18n";
import PublicFooter from "~/routes/layouts/public-footer";
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
    <VStack backgroundColor="ggt.page.bg" gap={0} minH="100vh" w="full">
      <VStack align="center" flex={1} gap={0} w="full">
        <HomeBand backgroundColor="transparent" p={0}>
          <HomeHero />
        </HomeBand>

        <HomeBand backgroundColor="ggt.page.bg">
          <HomeUpcomingEventsSection
            eventsState={eventsState}
            upcomingEvents={upcomingEvents}
          />
        </HomeBand>

        <HomeBand backgroundColor="white">
          <HomeEventsInfoPanel />
        </HomeBand>

        <HomeBand backgroundColor="ggt.page.bg">
          <HomeActionsSection />
        </HomeBand>
      </VStack>

      <Center bg="ggt.footer.bg" px={{ base: 4, md: 8 }} w="full">
        <Flex maxW="72em" w="full">
          <PublicFooter />
        </Flex>
      </Center>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Home Band
//------------------------------------------------------------------------------

type HomeBandProps = {
  backgroundColor: string;
  children: ReactNode;
  p?: number;
};

function HomeBand({ backgroundColor, children, p }: HomeBandProps) {
  return (
    <Center
      bg={backgroundColor}
      px={p ?? { base: 4, md: 8 }}
      py={p ?? { base: 8, md: 12 }}
      w="full"
    >
      <Box maxW="72em" w="full">
        {children}
      </Box>
    </Center>
  );
}
