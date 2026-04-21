import {
  Button,
  Field,
  HStack,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import useI18n from "~/i18n/use-i18n";
import {
  type EventVisibility,
  useEventVisibilityOptions,
} from "~/models/enums/event-visibility";
import Checkbox from "~/ui/checkbox";
import DatePicker from "~/ui/date-picker";
import Form from "~/ui/form";
import SelectEnum from "~/ui/select-enum";
import { initial, loading, success } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Admin Events New Page
//------------------------------------------------------------------------------

export default function AdminEventsNewPage() {
  const { locale, t } = useI18n();
  const [createEventState, setCreateEventState] = useState(initial());
  const eventVisibilityOptions = useEventVisibilityOptions();

  const createEvent = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      setCreateEventState(loading());

      const formData = new FormData(e.currentTarget);
      const getString = (key: string) => String(formData.get(key) ?? "").trim();

      const title = getString("title");
      const startsAtDate = formData.get("starts-at-date");
      const startsAtTime = formData.get("starts-at-time");
      const locationName = getString("location-name");
      const locationAddress = getString("location-address");
      const visibility = formData.get("visibility") ?? "private";
      const registrationsOpen = formData.get("registrations-open") === "on";

      console.log(
        title,
        startsAtDate,
        startsAtTime,
        locationName,
        locationAddress,
        visibility,
        registrationsOpen,
      );

      setCreateEventState(success(undefined));
    },
    [],
  );

  return (
    <Form
      display="flex"
      justifyContent="center"
      onSubmit={createEvent}
      w="full"
    >
      <VStack align="flex-start" gap={3} maxW="20em" p={1} w="full">
        <Heading size="3xl">{t("page.admin_events_new.heading")}</Heading>

        <Field.Root disabled={createEventState.isLoading} required>
          <Field.Label>
            {t("page.admin_events_new.title.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input name="title" pattern="\s*\S.*" size="sm" />
        </Field.Root>

        <HStack w="full">
          <Field.Root disabled={createEventState.isLoading} required>
            <Field.Label>
              {t("page.admin_events_new.starts_at_date.label")}
              <Field.RequiredIndicator />
            </Field.Label>
            <DatePicker
              locale={locale}
              name="starts-at-date"
              placeholder={t(
                "page.admin_events_new.starts_at_date.placeholder",
              )}
              size="sm"
            />
          </Field.Root>

          <Field.Root disabled={createEventState.isLoading} required>
            <Field.Label>
              {t("page.admin_events_new.starts_at_time.label")}
              <Field.RequiredIndicator />
            </Field.Label>
            <Input name="starts-at-time" type="time" />
          </Field.Root>
        </HStack>

        <Field.Root disabled={createEventState.isLoading} required>
          <Field.Label>
            {t("page.admin_events_new.location_name.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input name="location-name" pattern="\s*\S.*" size="sm" />
        </Field.Root>

        <Field.Root disabled={createEventState.isLoading}>
          <Field.Label>
            {t("page.admin_events_new.location_address.label")}
          </Field.Label>
          <Input name="location-address" size="sm" />
        </Field.Root>

        <Field.Root disabled={createEventState.isLoading} required>
          <Field.Label>
            {t("page.admin_events_new.visibility.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <SelectEnum<EventVisibility>
            defaultValue="public"
            name="visibility"
            options={eventVisibilityOptions}
            size="sm"
          />
        </Field.Root>

        <Field.Root disabled={createEventState.isLoading}>
          <Checkbox name="registrations-open" size="sm">
            {t("page.admin_events_new.registrations_open")}
          </Checkbox>
        </Field.Root>

        <Button size="sm" type="submit">
          {t("page.admin_events_new.create")}
        </Button>
      </VStack>
    </Form>
  );
}
