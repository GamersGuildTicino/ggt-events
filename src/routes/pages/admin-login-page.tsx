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
import { useCallback, useRef, useState } from "react";
import { PasswordInput } from "~/ui/password-input";

export function AdminLoginPage() {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState("");

  const signIn = useCallback(async (e: React.SubmitEvent) => {
    e.preventDefault();

    setSigningIn(true);
    setSignInError("");

    const formData = new FormData(e.target);
    const values = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(values);
    } catch {
      setSignInError("Something went wrong, please try again.");
    }

    setSigningIn(false);
  }, []);

  return (
    <form onSubmit={signIn}>
      <Center minH="100vh">
        <VStack align="flex-start" gap={3} maxW="20em" p={1} w="full">
          <Heading size="3xl">Sign in to GGT</Heading>

          <Field.Root disabled={signingIn} required>
            <Field.Label>Email</Field.Label>
            <Input name="email" ref={emailInputRef} size="sm" type="email" />
          </Field.Root>

          <Field.Root disabled={signingIn} required>
            <Field.Label>Password</Field.Label>
            <PasswordInput name="password" ref={passwordInputRef} size="sm" />
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
            <Link fontSize="sm" href="/admin/forgot-password" tabIndex={0}>
              Forgot password?
            </Link>
          </HStack>
        </VStack>
      </Center>
    </form>
  );
}
