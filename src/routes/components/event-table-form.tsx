import { Field, HStack, Input } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { EventTable } from "~/domain/event-tables";
import type { GameSystem } from "~/domain/game-systems";
import useI18n from "~/i18n/use-i18n";
import Form from "~/ui/form";
import SelectEnum from "~/ui/select-enum";

//------------------------------------------------------------------------------
// Event Table Form Value
//------------------------------------------------------------------------------

export type EventTableFormValue = Pick<
  EventTable,
  "gameMasterName" | "gameSystemId" | "maxPlayers" | "minPlayers" | "title"
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
};

export default function EventTableForm({
  actions,
  disabled,
  gameSystems,
  initialValue,
  message,
  onSubmit,
}: EventTableFormProps) {
  const { t } = useI18n();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(eventTableFormValueFromForm(e.currentTarget), e);
  };

  return (
    <Form
      alignItems="flex-start"
      display="flex"
      flexDirection="column"
      gap={3}
      onSubmit={handleSubmit}
      w="full"
    >
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

      <HStack w="full">
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
    gameMasterName: getString("game-master-name"),
    gameSystemId: getString("game-system-id"),
    maxPlayers: getNumber("max-players"),
    minPlayers: getNumber("min-players"),
    title: getString("title"),
  };
}
