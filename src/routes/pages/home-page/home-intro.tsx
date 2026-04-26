import { Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";
import HomeInfoCard from "./home-info-card";

//------------------------------------------------------------------------------
// Home Intro
//------------------------------------------------------------------------------

export default function HomeIntro() {
  const { t } = useI18n();

  return (
    <VStack align="stretch" gap={5} id="about">
      <VStack align="flex-start" gap={2}>
        <Heading size="2xl">{t("page.home.about.heading")}</Heading>
        <Text color="fg.muted" fontSize="lg">
          {t("page.home.about.description")}
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <HomeInfoCard
          description={t("page.home.about.card_1.description")}
          title={t("page.home.about.card_1.title")}
        />
        <HomeInfoCard
          description={t("page.home.about.card_2.description")}
          title={t("page.home.about.card_2.title")}
        />
        <HomeInfoCard
          description={t("page.home.about.card_3.description")}
          title={t("page.home.about.card_3.title")}
        />
      </SimpleGrid>
    </VStack>
  );
}
