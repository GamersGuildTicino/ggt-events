import { VStack } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";
import PagePlaceholder from "../components/page-placeholder";

//------------------------------------------------------------------------------
// Terms And Conditions Page
//------------------------------------------------------------------------------

export default function TermsAndConditionsPage() {
  const i18n = useI18n();

  return (
    <VStack minH="100vh">
      <PagePlaceholder title={i18n.t("page.terms_and_conditions.heading")} />
    </VStack>
  );
}
