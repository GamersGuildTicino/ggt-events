import {
  Card,
  Field,
  HStack,
  Heading,
  Input,
  Textarea,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import useI18n from "~/i18n/use-i18n";
import Form from "~/ui/form";

//------------------------------------------------------------------------------
// Game System Form Value
//------------------------------------------------------------------------------

export type GameSystemFormValue = {
  description: string;
  imageUrl: string;
  name: string;
};

//------------------------------------------------------------------------------
// Game System Form
//------------------------------------------------------------------------------

export type GameSystemFormProps = {
  actions: ReactNode;
  disabled?: boolean;
  initialValue?: GameSystemFormValue;
  message?: ReactNode;
  onSubmit: (
    value: GameSystemFormValue,
    e: React.SubmitEvent<HTMLFormElement>,
  ) => void;
};

export default function GameSystemForm({
  actions,
  disabled,
  initialValue,
  message,
  onSubmit,
}: GameSystemFormProps) {
  const { t } = useI18n();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(gameSystemFormValueFromForm(e.currentTarget), e);
  };

  return (
    <Card.Root>
      <Card.Body>
        <Form
          alignItems="flex-start"
          display="flex"
          flexDirection="column"
          gap={3}
          justifyContent="center"
          onSubmit={handleSubmit}
          w="full"
        >
          <Heading size="md">{t("form.game_system.heading")}</Heading>

          <Field.Root disabled={disabled} required>
            <Field.Label>
              {t("form.game_system.name.label")}
              <Field.RequiredIndicator />
            </Field.Label>
            <Input
              defaultValue={initialValue?.name}
              name="name"
              pattern="\s*\S.*"
              size="sm"
            />
          </Field.Root>

          <Field.Root disabled={disabled}>
            <Field.Label>{t("form.game_system.description.label")}</Field.Label>
            <Textarea
              defaultValue={initialValue?.description}
              name="description"
              size="sm"
            />
          </Field.Root>

          <Field.Root disabled={disabled}>
            <Field.Label>{t("form.game_system.image_url.label")}</Field.Label>
            <Input
              defaultValue={initialValue?.imageUrl}
              name="image-url"
              size="sm"
              type="url"
            />
          </Field.Root>

          {message}

          <HStack>{actions}</HStack>
        </Form>
      </Card.Body>
    </Card.Root>
  );
}

//------------------------------------------------------------------------------
// Game System Form Value From Form
//------------------------------------------------------------------------------

function gameSystemFormValueFromForm(
  form: HTMLFormElement,
): GameSystemFormValue {
  const formData = new FormData(form);
  const getString = (key: string) => String(formData.get(key) ?? "").trim();

  return {
    description: getString("description"),
    imageUrl: getString("image-url"),
    name: getString("name"),
  };
}
