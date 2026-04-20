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
import { Link as RouterLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "~/auth/use-auth";
import useI18n from "~/i18n/use-i18n";
import { PasswordInput } from "~/ui/password-input";
import { failure, initial, loading, success } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Admin Login Page
//------------------------------------------------------------------------------

type LoginLocationState = {
  from?: { pathname?: string; search?: string };
};

export default function AdminLoginPage() {
  const i18n = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { signInWithPassword } = useAuth();
  const [signInState, setSignInState] = useState(initial<void>());

  const signIn = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      setSignInState(loading());

      const formData = new FormData(e.currentTarget);
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      const error = await signInWithPassword(email, password);
      if (error) return setSignInState(failure(error));

      const state = location.state as LoginLocationState | null;
      const pathname = state?.from?.pathname ?? "/admin";
      const search = state?.from?.search ?? "";

      navigate(`${pathname}${search}`, { replace: true });
      setSignInState(success(undefined));
    },
    [location.state, navigate, signInWithPassword],
  );

  return (
    <form onSubmit={signIn}>
      <Center minH="100vh">
        <VStack align="flex-start" gap={3} maxW="20em" p={1} w="full">
          <Heading size="3xl">{i18n.t("admin.login.title")}</Heading>

          <Field.Root disabled={signInState.isLoading} required>
            <Field.Label>{i18n.t("admin.login.email.label")}</Field.Label>
            <Input autoComplete="email" name="email" size="sm" type="email" />
          </Field.Root>

          <Field.Root disabled={signInState.isLoading} required>
            <Field.Label>{i18n.t("admin.login.password.label")}</Field.Label>
            <PasswordInput
              autoComplete="current-password"
              name="password"
              size="sm"
            />
          </Field.Root>

          {signInState.hasError && (
            <Alert.Root status="error">
              <Alert.Description>{signInState.error}</Alert.Description>
            </Alert.Root>
          )}

          <HStack gap={3}>
            <Button loading={signInState.isLoading} size="sm" type="submit">
              {i18n.t("admin.login.sign_in")}
            </Button>
            <Link asChild fontSize="sm" tabIndex={0}>
              <RouterLink to="/admin/forgot-password">
                {i18n.t("admin.login.forgot_password")}
              </RouterLink>
            </Link>
          </HStack>
        </VStack>
      </Center>
    </form>
  );
}
