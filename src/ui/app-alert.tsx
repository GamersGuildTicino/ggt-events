import { Alert, CloseButton } from "@chakra-ui/react";
import { useCallback, useState } from "react";

//------------------------------------------------------------------------------
// App Alert
//------------------------------------------------------------------------------

export type AppAlertProps = {
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  status: "error" | "info" | "neutral" | "success" | "warning";
};

export default function AppAlert({
  children,
  dismissible = false,
  onDismiss,
  status,
}: AppAlertProps) {
  const [visible, setVisible] = useState(true);

  const dismissAppAlert = useCallback(() => {
    setVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <Alert.Root status={status}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>{children}</Alert.Description>
      </Alert.Content>

      {dismissible && (
        <CloseButton
          onClick={dismissAppAlert}
          position="absolute"
          right={2}
          top="50%"
          transform="translateY(-50%)"
        />
      )}
    </Alert.Root>
  );
}
