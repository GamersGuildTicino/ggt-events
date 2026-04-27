"use client";

import {
  Portal,
  Spinner,
  Stack,
  Toast,
  Toaster as ChakraToaster,
  createToaster,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Toaster
//------------------------------------------------------------------------------

const chakraToaster = createToaster({
  pauseOnPageIdle: true,
  placement: "bottom",
});

type Options = Parameters<(typeof chakraToaster)["create"]>[0];

// eslint-disable-next-line react-refresh/only-export-components
export const toaster = {
  ...chakraToaster,
  create: (o: Options) => chakraToaster.create({ closable: true, ...o }),
  error: (o: Options) => chakraToaster.error({ closable: true, ...o }),
  info: (o: Options) => chakraToaster.info({ closable: true, ...o }),
  success: (o: Options) => chakraToaster.success({ closable: true, ...o }),
  warning: (o: Options) => chakraToaster.warning({ closable: true, ...o }),
};

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster insetInline={{ mdDown: "4" }} toaster={toaster}>
        {(toast) => (
          <Toast.Root width={{ md: "sm" }}>
            {toast.type === "loading" ?
              <Spinner color="blue.solid" size="sm" />
            : <Toast.Indicator />}
            <Stack flex="1" gap="1" maxWidth="100%">
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            )}
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
};
