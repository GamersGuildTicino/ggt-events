import { Link, List, Separator, Text, VStack } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";
import Eyebrow from "~/ui/eyebrow";

//------------------------------------------------------------------------------
// Home Events Info Panel
//------------------------------------------------------------------------------

export default function HomeEventsInfoPanel() {
  const { t } = useI18n();
  const infoAddress = import.meta.env["VITE_INFO_ADDRESS"];

  return (
    <VStack
      align="stretch"
      bg="ggt.surface.bg"
      borderColor="ggt.surface.border"
      borderWidth="1px"
      flex={1}
      p={6}
      w="full"
    >
      <Eyebrow>{t("page.home.events.info_eyebrow")}</Eyebrow>

      <Text>{t("page.home.events.info_intro")}</Text>

      <List.Root gap={1.5} lineHeight={1.2} variant="plain">
        <List.Item>• {t("page.home.events.info_step_1")}</List.Item>
        <List.Item>• {t("page.home.events.info_step_2")}</List.Item>
        <List.Item>• {t("page.home.events.info_step_3")}</List.Item>
      </List.Root>

      <Separator my={2} />

      <VStack align="flex-start" gap={1}>
        <Text color="fg.muted" fontSize="sm">
          {t("page.home.events.contact_text")}
        </Text>

        <Link href={`mailto:${infoAddress}`}>
          {t("page.home.events.contact_cta")}
        </Link>
      </VStack>
    </VStack>
  );
}
