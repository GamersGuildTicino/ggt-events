import { VStack } from "@chakra-ui/react";
import usePageTitle from "~/hooks/use-page-title";
import useI18n from "~/i18n/use-i18n";
import PagePlaceholder from "../../components/page-placeholder";

//------------------------------------------------------------------------------
// Terms And Conditions Page
//------------------------------------------------------------------------------

export default function TermsAndConditionsPage() {
  const i18n = useI18n();

  usePageTitle(i18n.t("page.terms_and_conditions.heading"));

  return (
    <VStack minH="100vh">
      <PagePlaceholder title={i18n.t("page.terms_and_conditions.heading")} />
    </VStack>
  );
}
