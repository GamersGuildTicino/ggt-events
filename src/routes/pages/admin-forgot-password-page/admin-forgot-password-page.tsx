import {
  Alert,
  Button,
  Field,
  HStack,
  Heading,
  Input,
  Link,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { Link as RouterLink } from "react-router";
import useI18n from "~/i18n/use-i18n";
import { resetPasswordForEmail } from "~/lib/supabase";
import Form from "~/ui/form";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Admin Forgot Password Page
//------------------------------------------------------------------------------

export default function AdminForgotPasswordPage() {
  const i18n = useI18n();
  const [resetPasswordState, setResetPasswordState] =
    useState<AsyncState>(initial());

  const resetPassword = useCallback(
    async (event: React.SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      setResetPasswordState(loading());

      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "").trim();

      const error = await resetPasswordForEmail(email);
      if (error) return setResetPasswordState(failure(error));

      setResetPasswordState(success(undefined));
    },
    [],
  );

  return (
    <Form
      alignItems="center"
      display="flex"
      justifyContent="center"
      minH="100vh"
      onSubmit={resetPassword}
    >
      <VStack align="flex-start" gap={3} maxW="20em" p={1} w="full">
        <Heading size="3xl">
          {i18n.t("page.admin_forgot_password.heading")}
        </Heading>

        <Field.Root disabled={resetPasswordState.isLoading} required>
          <Field.Label>
            {i18n.t("page.admin_forgot_password.email.label")}
          </Field.Label>
          <Input autoComplete="email" name="email" size="sm" type="email" />
        </Field.Root>

        {resetPasswordState.hasError && (
          <Alert.Root status="error">
            <Alert.Description>{resetPasswordState.error}</Alert.Description>
          </Alert.Root>
        )}

        {resetPasswordState.isSuccess && (
          <Alert.Root status="success">
            <Alert.Description>
              {i18n.t("page.admin_forgot_password.confirmation")}
            </Alert.Description>
          </Alert.Root>
        )}

        <HStack gap={3}>
          <Button
            loading={resetPasswordState.isLoading}
            size="sm"
            type="submit"
          >
            {i18n.t("page.admin_forgot_password.send")}
          </Button>
          <Link asChild fontSize="sm">
            <RouterLink to="/admin/login">
              {i18n.t("page.admin_forgot_password.back_to_login")}
            </RouterLink>
          </Link>
        </HStack>
      </VStack>
    </Form>
  );
}
