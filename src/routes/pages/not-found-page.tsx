import { VStack } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";
import PagePlaceholder from "../components/page-placeholder";

//------------------------------------------------------------------------------
// Not Found Page
//------------------------------------------------------------------------------

export default function NotFoundPage() {
  const i18n = useI18n();

  return (
    <VStack minH="100vh">
      <PagePlaceholder title={i18n.t("page.not_found.title")} />
    </VStack>
  );
}
