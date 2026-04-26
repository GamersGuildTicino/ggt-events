import { Alert } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Home Upcoming Events Error
//------------------------------------------------------------------------------

type HomeUpcomingEventsErrorProps = {
  error: string;
};

export default function HomeUpcomingEventsError({
  error,
}: HomeUpcomingEventsErrorProps) {
  const { t } = useI18n();

  return (
    <Alert.Root status="error">
      <Alert.Description>{t(error)}</Alert.Description>
    </Alert.Root>
  );
}
