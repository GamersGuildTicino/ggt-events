import { Badge, HStack, Menu as ChakraMenu, Portal } from "@chakra-ui/react";
import { EllipsisVertical } from "lucide-react";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import { isEventOver } from "~/domain/event-time-slots";
import useI18n from "~/i18n/use-i18n";
import IconButton from "~/ui/icon-button";

//------------------------------------------------------------------------------
// Admin Event Page Heading Actions
//------------------------------------------------------------------------------

type AdminEventPageHeadingActionsProps = {
  eventHasEmails: boolean;
  onComposeEmail: () => void;
  onCopyEmails: () => void;
  timeSlots: EventTimeSlot[];
};

export default function AdminEventPageHeadingActions({
  eventHasEmails,
  onComposeEmail,
  onCopyEmails,
  timeSlots,
}: AdminEventPageHeadingActionsProps) {
  const { t } = useI18n();
  const eventOver = isEventOver(timeSlots);

  return (
    <HStack>
      {eventOver && (
        <Badge colorPalette="orange" size="lg">
          {t("page.admin_event.event_over")}
        </Badge>
      )}

      <ChakraMenu.Root positioning={{ placement: "bottom-end" }}>
        <ChakraMenu.Trigger asChild>
          <IconButton
            Icon={EllipsisVertical}
            aria-label={t("page.admin_events.more")}
            size="sm"
            variant="ghost"
          />
        </ChakraMenu.Trigger>
        <Portal>
          <ChakraMenu.Positioner>
            <ChakraMenu.Content minW="12rem">
              <ChakraMenu.Item
                disabled={!eventHasEmails}
                onClick={onComposeEmail}
                value="compose-email"
              >
                {t("page.admin_events.compose_email")}
              </ChakraMenu.Item>
              <ChakraMenu.Item
                disabled={!eventHasEmails}
                onClick={onCopyEmails}
                value="copy-emails"
              >
                {t("page.admin_events.copy_emails")}
              </ChakraMenu.Item>
            </ChakraMenu.Content>
          </ChakraMenu.Positioner>
        </Portal>
      </ChakraMenu.Root>
    </HStack>
  );
}
