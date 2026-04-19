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
import { PasswordInput } from "~/ui/password-input";
import { failure, initial, loading, success } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Admin Login Page
//------------------------------------------------------------------------------

type LoginLocationState = {
  from?: { pathname?: string; search?: string };
};

export default function AdminLoginPage() {
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
          <Heading size="3xl">Sign in to GGT</Heading>

          <Field.Root disabled={signInState.isLoading} required>
            <Field.Label>Email</Field.Label>
            <Input autoComplete="email" name="email" size="sm" type="email" />
          </Field.Root>

          <Field.Root disabled={signInState.isLoading} required>
            <Field.Label>Password</Field.Label>
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
              Sign In
            </Button>
            <Link asChild fontSize="sm" tabIndex={0}>
              <RouterLink to="/admin/forgot-password">
                Forgot password?
              </RouterLink>
            </Link>
          </HStack>
        </VStack>
      </Center>
    </form>
  );
}
