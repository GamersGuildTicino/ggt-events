import { Alert, Button, Field, Heading, Link, VStack } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router";
import { useAuth } from "~/auth/use-auth";
import useI18n from "~/i18n/use-i18n";
import { signOut, updatePassword } from "~/lib/supabase";
import Form from "~/ui/form";
import { PasswordInput } from "~/ui/password-input";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Admin Reset Password Page
//------------------------------------------------------------------------------

export default function AdminResetPasswordPage() {
  const { t } = useI18n();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [updatePasswordState, setUpdatePasswordState] =
    useState<AsyncState>(initial());

  const resetPassword = useCallback(
    async (event: React.SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const password = String(formData.get("password") ?? "");
      const confirmPassword = String(formData.get("confirm-password") ?? "");

      if (password !== confirmPassword) {
        return setUpdatePasswordState(
          failure("page.admin_reset_password.error.password_mismatch"),
        );
      }

      setUpdatePasswordState(loading());

      const error = await updatePassword(password);
      if (error)
        return setUpdatePasswordState(
          failure("page.admin_reset_password.error.generic"),
        );

      setUpdatePasswordState(success(undefined));
      await signOut();
      navigate("/admin/login", { replace: true });
    },
    [navigate],
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
        <Heading size="3xl">{t("page.admin_reset_password.heading")}</Heading>

        {!isLoading && !isAuthenticated && (
          <Alert.Root status="error">
            <Alert.Description>
              {t("page.admin_reset_password.error.invalid_link")}
            </Alert.Description>
          </Alert.Root>
        )}

        <Field.Root
          disabled={!isAuthenticated || updatePasswordState.isLoading}
          required
        >
          <Field.Label>
            {t("page.admin_reset_password.password.label")}
          </Field.Label>
          <PasswordInput
            autoComplete="new-password"
            name="password"
            size="sm"
          />
        </Field.Root>

        <Field.Root
          disabled={!isAuthenticated || updatePasswordState.isLoading}
          required
        >
          <Field.Label>
            {t("page.admin_reset_password.confirm_password.label")}
          </Field.Label>
          <PasswordInput
            autoComplete="new-password"
            name="confirm-password"
            size="sm"
          />
        </Field.Root>

        {updatePasswordState.hasError && (
          <Alert.Root status="error">
            <Alert.Description>
              {t(updatePasswordState.error)}
            </Alert.Description>
          </Alert.Root>
        )}

        {updatePasswordState.isSuccess && (
          <Alert.Root status="success">
            <Alert.Description>
              {t("page.admin_reset_password.success")}
            </Alert.Description>
          </Alert.Root>
        )}

        <Button
          disabled={!isAuthenticated}
          loading={updatePasswordState.isLoading}
          size="sm"
          type="submit"
        >
          {t("page.admin_reset_password.submit")}
        </Button>

        <Link asChild fontSize="sm">
          <RouterLink to="/admin/login">
            {t("page.admin_reset_password.back_to_login")}
          </RouterLink>
        </Link>
      </VStack>
    </Form>
  );
}
