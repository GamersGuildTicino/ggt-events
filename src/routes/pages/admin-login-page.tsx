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

type LoginLocationState = {
  from?: { pathname?: string; search?: string };
};

export function AdminLoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState("");
  const { signInWithPassword } = useAuth();

  const signIn = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      setSigningIn(true);
      setSignInError("");

      const formData = new FormData(e.currentTarget);
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      const error = await signInWithPassword(email, password);

      if (error) {
        setSignInError(error);
        setSigningIn(false);
        return;
      }

      const state = location.state as LoginLocationState | null;
      const pathname = state?.from?.pathname ?? "/admin";
      const search = state?.from?.search ?? "";

      navigate(`${pathname}${search}`, { replace: true });
      setSigningIn(false);
    },
    [location.state, navigate, signInWithPassword],
  );

  return (
    <form onSubmit={signIn}>
      <Center minH="100vh">
        <VStack align="flex-start" gap={3} maxW="20em" p={1} w="full">
          <Heading size="3xl">Sign in to GGT</Heading>

          <Field.Root disabled={signingIn} required>
            <Field.Label>Email</Field.Label>
            <Input autoComplete="email" name="email" size="sm" type="email" />
          </Field.Root>

          <Field.Root disabled={signingIn} required>
            <Field.Label>Password</Field.Label>
            <PasswordInput
              autoComplete="current-password"
              name="password"
              size="sm"
            />
          </Field.Root>

          {signInError && (
            <Alert.Root status="error">
              <Alert.Description>{signInError}</Alert.Description>
            </Alert.Root>
          )}

          <HStack gap={3}>
            <Button loading={signingIn} size="sm" type="submit">
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
