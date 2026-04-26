import { Field, HStack, Input, Textarea } from "@chakra-ui/react";
import type { ReactNode } from "react";
import {
  type EventTableExperienceLevel,
  useEventTableExperienceLevelOptions,
} from "~/domain/enums/event-table-experience-level";
import {
  type EventTableLanguage,
  useEventTableLanguageOptions,
} from "~/domain/enums/event-table-language";
import type { EventTable } from "~/domain/event-tables";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import type { GameSystem } from "~/domain/game-systems";
import useI18n from "~/i18n/use-i18n";
import Form from "~/ui/form";
import SelectEnum from "~/ui/select-enum";

//------------------------------------------------------------------------------
// Event Table Form Value
//------------------------------------------------------------------------------

export type EventTableFormValue = Pick<
  EventTable,
  | "description"
  | "experienceLevel"
  | "gameMasterName"
  | "gameSystemId"
  | "imageUrl"
  | "language"
  | "maxPlayers"
  | "minPlayers"
  | "notes"
  | "timeSlotId"
  | "title"
>;

//------------------------------------------------------------------------------
// Event Table Form
//------------------------------------------------------------------------------

export type EventTableFormProps = {
  actions: ReactNode;
  disabled?: boolean;
  gameSystems: GameSystem[];
  initialValue?: EventTableFormValue;
  message?: ReactNode;
  onSubmit: (
    value: EventTableFormValue,
    e: React.SubmitEvent<HTMLFormElement>,
  ) => void;
  timeSlots: EventTimeSlot[];
};

export default function EventTableForm({
  actions,
  disabled,
  gameSystems,
  initialValue,
  message,
  onSubmit,
  timeSlots,
}: EventTableFormProps) {
  const { locale, t } = useI18n();
  const experienceLevelOptions = useEventTableExperienceLevelOptions();
  const languageOptions = useEventTableLanguageOptions();

  const submit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(eventTableFormValueFromForm(e.currentTarget), e);
  };

  return (
    <Form
      alignItems="flex-start"
      display="flex"
      flexDirection="column"
      gap={3}
      onSubmit={submit}
      w="full"
    >
      <HStack w="full">
        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("form.event_table.title.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            defaultValue={initialValue?.title}
            name="title"
            pattern="\s*\S.*"
            size="sm"
          />
        </Field.Root>

        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("form.event_table.game_system.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <SelectEnum<string>
            defaultValue={initialValue?.gameSystemId ?? gameSystems[0]?.id}
            name="game-system-id"
            options={gameSystems.map((gameSystem) => ({
              label: gameSystem.name,
              value: gameSystem.id,
            }))}
            size="sm"
          />
        </Field.Root>
      </HStack>

      <HStack w="full">
        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("form.event_table.game_master_name.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            defaultValue={initialValue?.gameMasterName}
            name="game-master-name"
            pattern="\s*\S.*"
            size="sm"
          />
        </Field.Root>

        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("form.event_table.min_players.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            defaultValue={initialValue?.minPlayers ?? 3}
            min={0}
            name="min-players"
            size="sm"
            type="number"
          />
        </Field.Root>

        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("form.event_table.max_players.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            defaultValue={initialValue?.maxPlayers ?? 5}
            min={0}
            name="max-players"
            size="sm"
            type="number"
          />
        </Field.Root>
      </HStack>

      <Field.Root disabled={disabled} required>
        <Field.Label>
          {t("form.event_table.time_slot.label")}
          <Field.RequiredIndicator />
        </Field.Label>
        <SelectEnum<string>
          defaultValue={initialValue?.timeSlotId ?? timeSlots[0]?.id}
          name="time-slot-id"
          options={timeSlots.map((timeSlot) => ({
            label: formatSlot(timeSlot, locale),
            value: timeSlot.id,
          }))}
          size="sm"
        />
      </Field.Root>

      <HStack w="full">
        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("form.event_table.experience_level.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <SelectEnum<EventTableExperienceLevel>
            defaultValue={initialValue?.experienceLevel ?? "unspecified"}
            name="experience-level"
            options={experienceLevelOptions}
            size="sm"
          />
        </Field.Root>

        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("form.event_table.language.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <SelectEnum<EventTableLanguage>
            defaultValue={initialValue?.language ?? "italian"}
            name="language"
            options={languageOptions}
            size="sm"
          />
        </Field.Root>
      </HStack>

      <Field.Root disabled={disabled}>
        <Field.Label>{t("form.event_table.description.label")}</Field.Label>
        <Textarea
          defaultValue={initialValue?.description}
          name="description"
          size="sm"
        />
      </Field.Root>

      <Field.Root disabled={disabled}>
        <Field.Label>{t("form.event_table.image_url.label")}</Field.Label>
        <Input
          defaultValue={initialValue?.imageUrl}
          name="image-url"
          size="sm"
          type="url"
        />
      </Field.Root>

      <Field.Root disabled={disabled}>
        <Field.Label>{t("form.event_table.notes.label")}</Field.Label>
        <Textarea defaultValue={initialValue?.notes} name="notes" size="sm" />
      </Field.Root>

      {message}

      <HStack>{actions}</HStack>
    </Form>
  );
}

//------------------------------------------------------------------------------
// Event Table Form Value From Form
//------------------------------------------------------------------------------

function eventTableFormValueFromForm(form: HTMLFormElement) {
  const formData = new FormData(form);
  const getString = (key: string) => String(formData.get(key) ?? "").trim();
  const getNumber = (key: string) => Number(formData.get(key));

  return {
    description: getString("description"),
    experienceLevel: getString("experience-level") as EventTableExperienceLevel,
    gameMasterName: getString("game-master-name"),
    gameSystemId: getString("game-system-id"),
    imageUrl: getString("image-url"),
    language: getString("language") as EventTableLanguage,
    maxPlayers: getNumber("max-players"),
    minPlayers: getNumber("min-players"),
    notes: getString("notes"),
    timeSlotId: getString("time-slot-id"),
    title: getString("title"),
  };
}

//------------------------------------------------------------------------------
// Format Slot
//------------------------------------------------------------------------------

function formatSlot(timeSlot: EventTimeSlot, locale: string) {
  return `${formatDateTime(timeSlot.startsAt, locale)}-${formatTime(timeSlot.endsAt, locale)}`;
}

//------------------------------------------------------------------------------
// Format Date Time
//------------------------------------------------------------------------------

function formatDateTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

//------------------------------------------------------------------------------
// Format Time
//------------------------------------------------------------------------------

function formatTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(date);
}
