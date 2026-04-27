import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";

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

  return <AppAlert status="error">{t(error)}</AppAlert>;
}
