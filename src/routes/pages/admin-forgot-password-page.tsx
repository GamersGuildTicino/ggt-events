import {
  Alert,
  Button,
  Center,
  Field,
  HStack,
  Heading,
  Input,
  Link,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { Link as RouterLink } from "react-router";
import { useAuth } from "~/auth/use-auth";
import { failure, initial, loading, success } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Admin Forgot Password Page
//------------------------------------------------------------------------------

export default function AdminForgotPasswordPage() {
  const [resetPasswordState, setResetPasswordState] = useState(initial<void>());
  const { resetPasswordForEmail } = useAuth();

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
    [resetPasswordForEmail],
  );

  return (
    <form onSubmit={resetPassword}>
      <Center minH="100vh">
        <VStack align="flex-start" gap={3} maxW="20em" p={1} w="full">
          <Heading size="3xl">Reset password</Heading>

          <Field.Root disabled={resetPasswordState.isLoading} required>
            <Field.Label>Email</Field.Label>
            <Input autoComplete="email" name="email" size="sm" type="email" />
          </Field.Root>

          {resetPasswordState.hasError && (
            <Alert.Root status="error">
              <Alert.Description>{resetPasswordState.error}</Alert.Description>
            </Alert.Root>
          )}

          {resetPasswordState.status === "success" && (
            <Alert.Root status="success">
              <Alert.Description>
                If that account exists, a reset email has been sent.
              </Alert.Description>
            </Alert.Root>
          )}

          <HStack gap={3}>
            <Button
              loading={resetPasswordState.isLoading}
              size="sm"
              type="submit"
            >
              Send reset email
            </Button>
            <Link asChild fontSize="sm">
              <RouterLink to="/admin/login">Back to login</RouterLink>
            </Link>
          </HStack>
        </VStack>
      </Center>
    </form>
  );
}
