import {
  Card,
  Field,
  HStack,
  Heading,
  Input,
  Textarea,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useCallback } from "react";
import type { HomeMessage } from "~/domain/home-messages";
import useI18n from "~/i18n/use-i18n";
import Checkbox from "~/ui/checkbox";
import Form from "~/ui/form";

//------------------------------------------------------------------------------
// Home Message Form Value
//------------------------------------------------------------------------------

export type HomeMessageFormValue = Pick<
  HomeMessage,
  "body" | "enabled" | "title"
>;

//------------------------------------------------------------------------------
// Home Message Form
//------------------------------------------------------------------------------

export type HomeMessageFormProps = {
  actions: ReactNode;
  disabled?: boolean;
  initialValue?: HomeMessageFormValue;
  message?: ReactNode;
  onSubmit: (
    value: HomeMessageFormValue,
    e: React.SubmitEvent<HTMLFormElement>,
  ) => void;
};

export default function HomeMessageForm({
  actions,
  disabled,
  initialValue,
  message,
  onSubmit,
}: HomeMessageFormProps) {
  const { t } = useI18n();

  const submitHomeMessageForm = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(homeMessageFormValueFromForm(e.currentTarget), e);
    },
    [onSubmit],
  );

  return (
    <Card.Root>
      <Card.Body>
        <Form
          alignItems="flex-start"
          display="flex"
          flexDirection="column"
          gap={3}
          justifyContent="center"
          onSubmit={submitHomeMessageForm}
          w="full"
        >
          <Heading size="md">{t("form.home_message.heading")}</Heading>

          <Field.Root disabled={disabled} my={2}>
            <Checkbox
              defaultChecked={initialValue?.enabled}
              name="enabled"
              size="sm"
            >
              {t("form.home_message.enabled")}
            </Checkbox>
          </Field.Root>

          <Field.Root disabled={disabled}>
            <Field.Label>{t("form.home_message.title_it.label")}</Field.Label>
            <Input
              defaultValue={initialValue?.title["it-CH"]}
              name="title-it-ch"
              size="sm"
            />
          </Field.Root>

          <Field.Root disabled={disabled}>
            <Field.Label>{t("form.home_message.body_it.label")}</Field.Label>
            <Textarea
              defaultValue={initialValue?.body["it-CH"]}
              name="body-it-ch"
              size="sm"
            />
          </Field.Root>

          <Field.Root disabled={disabled}>
            <Field.Label>{t("form.home_message.title_en.label")}</Field.Label>
            <Input
              defaultValue={initialValue?.title["en-GB"]}
              name="title-en-gb"
              size="sm"
            />
          </Field.Root>

          <Field.Root disabled={disabled}>
            <Field.Label>{t("form.home_message.body_en.label")}</Field.Label>
            <Textarea
              defaultValue={initialValue?.body["en-GB"]}
              name="body-en-gb"
              size="sm"
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
// Home Message Form Value From Form
//------------------------------------------------------------------------------

function homeMessageFormValueFromForm(
  form: HTMLFormElement,
): HomeMessageFormValue {
  const formData = new FormData(form);
  const getString = (key: string) => String(formData.get(key) ?? "").trim();

  return {
    body: {
      "en-GB": getString("body-en-gb"),
      "it-CH": getString("body-it-ch"),
    },
    enabled: formData.has("enabled"),
    title: {
      "en-GB": getString("title-en-gb"),
      "it-CH": getString("title-it-ch"),
    },
  };
}
