import { Menu as ChakraMenu, Portal } from "@chakra-ui/react";
import { EllipsisVertical } from "lucide-react";
import type { Event } from "~/domain/events";
import useI18n from "~/i18n/use-i18n";
import IconButton from "~/ui/icon-button";

//------------------------------------------------------------------------------
// Admin Event Card Menu
//------------------------------------------------------------------------------

type AdminEventCardMenuProps = {
  canEmail: boolean;
  event: Event;
  onComposeEmail: (event: Event) => void;
  onCopyEmails: (event: Event) => void;
  onDelete: (event: Event) => void;
};

export default function AdminEventCardMenu({
  canEmail,
  event,
  onComposeEmail,
  onCopyEmails,
  onDelete,
}: AdminEventCardMenuProps) {
  const { t } = useI18n();

  return (
    <ChakraMenu.Root positioning={{ placement: "bottom-end" }}>
      <ChakraMenu.Trigger asChild>
        <IconButton
          Icon={EllipsisVertical}
          aria-label={t("page.admin_events.more")}
          size="xs"
          variant="ghost"
        />
      </ChakraMenu.Trigger>
      <Portal>
        <ChakraMenu.Positioner>
          <ChakraMenu.Content minW="12rem">
            <ChakraMenu.Item
              disabled={!canEmail}
              onClick={() => onComposeEmail(event)}
              value="compose-email"
            >
              {t("page.admin_events.compose_email")}
            </ChakraMenu.Item>
            <ChakraMenu.Item
              disabled={!canEmail}
              onClick={() => onCopyEmails(event)}
              value="copy-emails"
            >
              {t("page.admin_events.copy_emails")}
            </ChakraMenu.Item>
            <ChakraMenu.Separator />
            <ChakraMenu.Item
              color="fg.error"
              onClick={() => onDelete(event)}
              value="delete"
            >
              {t("page.admin_events.delete")}
            </ChakraMenu.Item>
          </ChakraMenu.Content>
        </ChakraMenu.Positioner>
      </Portal>
    </ChakraMenu.Root>
  );
}
